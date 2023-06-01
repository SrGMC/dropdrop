import { browser } from '$app/environment';
import { writable } from 'svelte/store';

let recentBoxesArray: string[] = [];
export const recentBoxes = writable(recentBoxesArray);

if (browser) {
	if (localStorage.getItem('recentBoxes')) {
		recentBoxesArray = JSON.parse(<string>localStorage.getItem('recentBoxes'));
		recentBoxes.set(recentBoxesArray);
	} else {
		localStorage.setItem('recentBoxes', JSON.stringify(recentBoxesArray));
	}
}

export function addRecentBox(boxId: string) {
    if(boxId == undefined || boxId == null) {
        return;
    }
	if (!recentBoxesArray.includes(boxId)) {
		if (recentBoxesArray.length >= 5) {
			recentBoxesArray.splice(0, 1);
		}
		recentBoxesArray.push(boxId);
		recentBoxes.set(recentBoxesArray);
		localStorage.setItem('recentBoxes', JSON.stringify(recentBoxesArray));
	}
}
