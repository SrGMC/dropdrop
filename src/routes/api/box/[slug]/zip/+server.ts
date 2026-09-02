import { resolveBoxPath } from '$lib/files/paths';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

// CRC-32 with the standard ZIP polynomial (0xEDB88320, reflected)
const CRC_TABLE = (() => {
	const t = new Uint32Array(256);
	for (let i = 0; i < 256; i++) {
		let c = i;
		for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		t[i] = c;
	}
	return t;
})();

function crc32(prev: number, buf: Buffer): number {
	let c = prev ^ 0xffffffff;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function dosTime(d: Date): { time: number; date: number } {
	return {
		time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
		date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
	};
}

interface ZipEntry {
	fullPath: string;
	zipPath: string;
	size: number;
	mtime: Date;
}

function walk(dir: string, prefix: string): ZipEntry[] {
	const out: ZipEntry[] = [];
	for (const name of fs.readdirSync(dir)) {
		const full = path.join(dir, name);
		const stat = fs.statSync(full);
		const zp = prefix ? `${prefix}/${name}` : name;
		if (stat.isDirectory()) out.push(...walk(full, zp));
		else out.push({ fullPath: full, zipPath: zp, size: stat.size, mtime: stat.mtime });
	}
	return out;
}

// Exact byte count for a store-only zip with data descriptors, no extra fields.
// Per entry: 30 (local header) + nameLen + size + 16 (data descriptor)
//          + 46 (CD entry) + nameLen
// Plus 22 for end-of-central-directory.
function zipSize(entries: ZipEntry[]): number {
	let n = 22;
	for (const e of entries) {
		const nl = Buffer.byteLength(e.zipPath, 'utf8');
		n += 30 + nl + e.size + 16 + 46 + nl;
	}
	return n;
}

async function* streamZip(entries: ZipEntry[]): AsyncGenerator<Buffer> {
	type CDMeta = { nameBuf: Buffer; crc: number; size: number; dt: ReturnType<typeof dosTime>; offset: number };
	const cd: CDMeta[] = [];
	let offset = 0;

	for (const e of entries) {
		const nameBuf = Buffer.from(e.zipPath, 'utf8');
		const dt = dosTime(e.mtime);
		const localOffset = offset;

		// Local file header — CRC/sizes deferred to data descriptor (bit 3 set)
		const lh = Buffer.alloc(30);
		lh.writeUInt32LE(0x04034b50, 0);
		lh.writeUInt16LE(20, 4);          // version needed
		lh.writeUInt16LE(0x0008, 6);      // general purpose: bit 3 (data descriptor)
		lh.writeUInt16LE(0, 8);            // compression: store
		lh.writeUInt16LE(dt.time, 10);
		lh.writeUInt16LE(dt.date, 12);
		lh.writeUInt32LE(0, 14);           // CRC-32 deferred
		lh.writeUInt32LE(0, 18);           // compressed size deferred
		lh.writeUInt32LE(0, 22);           // uncompressed size deferred
		lh.writeUInt16LE(nameBuf.length, 26);
		lh.writeUInt16LE(0, 28);           // extra field length
		yield lh;
		yield nameBuf;
		offset += 30 + nameBuf.length;

		let checksum = 0;
		for await (const chunk of fs.createReadStream(e.fullPath) as AsyncIterable<Buffer>) {
			checksum = crc32(checksum, chunk);
			yield chunk;
		}
		offset += e.size;

		// Data descriptor
		const dd = Buffer.alloc(16);
		dd.writeUInt32LE(0x08074b50, 0);
		dd.writeUInt32LE(checksum, 4);
		dd.writeUInt32LE(e.size, 8);
		dd.writeUInt32LE(e.size, 12);
		yield dd;
		offset += 16;

		cd.push({ nameBuf, crc: checksum, size: e.size, dt, offset: localOffset });
	}

	// Central directory
	const cdStart = offset;
	for (const m of cd) {
		const ch = Buffer.alloc(46);
		ch.writeUInt32LE(0x02014b50, 0);
		ch.writeUInt16LE(20, 4);
		ch.writeUInt16LE(20, 6);
		ch.writeUInt16LE(0x0008, 8);       // bit 3
		ch.writeUInt16LE(0, 10);            // store
		ch.writeUInt16LE(m.dt.time, 12);
		ch.writeUInt16LE(m.dt.date, 14);
		ch.writeUInt32LE(m.crc, 16);
		ch.writeUInt32LE(m.size, 20);
		ch.writeUInt32LE(m.size, 24);
		ch.writeUInt16LE(m.nameBuf.length, 28);
		ch.writeUInt16LE(0, 30);            // extra
		ch.writeUInt16LE(0, 32);            // comment
		ch.writeUInt16LE(0, 34);            // disk start
		ch.writeUInt16LE(0, 36);            // internal attr
		ch.writeUInt32LE(0, 38);            // external attr
		ch.writeUInt32LE(m.offset, 42);
		yield ch;
		yield m.nameBuf;
		offset += 46 + m.nameBuf.length;
	}

	// End of central directory
	const eocd = Buffer.alloc(22);
	eocd.writeUInt32LE(0x06054b50, 0);
	eocd.writeUInt16LE(0, 4);
	eocd.writeUInt16LE(0, 6);
	eocd.writeUInt16LE(cd.length, 8);
	eocd.writeUInt16LE(cd.length, 10);
	eocd.writeUInt32LE(offset - cdStart, 12);  // CD size
	eocd.writeUInt32LE(cdStart, 16);            // CD offset
	eocd.writeUInt16LE(0, 20);
	yield eocd;
}

export async function POST({ params, request }): Promise<Response> {
	const boxId: string = params.slug;

	let inputPaths: string[][];
	try {
		const body = await request.json();
		if (!Array.isArray(body.paths)) throw new Error();
		inputPaths = body.paths;
	} catch {
		throw error(400, 'Expected { paths: string[][] }');
	}

	const entries: ZipEntry[] = [];
	for (const segments of inputPaths) {
		if (!Array.isArray(segments) || segments.length === 0) continue;
		const fullPath = resolveBoxPath(boxId, segments);
		if (!fs.existsSync(fullPath)) continue;
		const stat = fs.statSync(fullPath);
		const name = segments[segments.length - 1];
		if (stat.isDirectory()) {
			entries.push(...walk(fullPath, name));
		} else {
			entries.push({ fullPath, zipPath: name, size: stat.size, mtime: stat.mtime });
		}
	}

	if (entries.length === 0) throw error(400, 'No valid paths');

	const contentLength = zipSize(entries);

	const body = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of streamZip(entries)) controller.enqueue(chunk);
				controller.close();
			} catch (err) {
				controller.error(err);
			}
		}
	});

	return new Response(body, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="${boxId}.zip"`,
			'Content-Length': String(contentLength)
		}
	});
}
