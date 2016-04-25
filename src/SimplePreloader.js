const _ = new WeakMap();

export default class SimplePreloader {

	constructor({
		onComplete = null,
		onProgress = null
	} = {}) {

		_.set(this, {
			concurent: 6,
			onComplete,
			onProgress,
			queue: []
		});
	}

	fileLoadedHandler(res, el) {

		el.worker.terminate();

		el.isLoading = false;
		el.blobUrl = window.URL.createObjectURL(res);

		const status = this.getStatus(el.group);

		if (status.notStarted) this.startDownload(el.group, 1);
		else if (!status.notFinished && _.get(this).onComplete) _.get(this).onComplete();
	}

	getStatus(group) {

		let notStarted = 0;
		let notFinished = 0;

		for (const el of this.getGroupQueue(group)) {

			if (!el.isLoading && !el.blobUrl) notStarted++;
			else if (el.isLoading) notFinished++;
		}

		return {
			notStarted,
			notFinished
		};
	}

	addToQueue(file) {

		let item;

		if (typeof file === 'string') {

			item = {
				url: file
			};
		}
		else {

			item = file;
		}

		if (!item.id) item.id = item.url;

		item.isLoading = false;
		item.downloadedSize = 0;
		item.totalSize = 0;
		item.blobUrl = null;

		_.get(this).queue.push(item);
	}

	filterByGroup(group) {

		return function(el) {

			return el.group === group;
		};
	}

	getGroupQueue(group) {

		return group ? _.get(this).queue.filter(this.filterByGroup(group)) : _.get(this).queue;
	}

	getHeaders(group) {

		for (const el of this.getGroupQueue(group)) {

			if (el.blobUrl || el.totalSize) continue;

			const xhr = new XMLHttpRequest();
			xhr.open('HEAD', el.url);

			xhr.onload = ()=> {

				el.totalSize = xhr.getResponseHeader('Content-Length');
			};

			xhr.send();
		}
	}

	startDownload(group = null, limit = _.get(this).concurent) {

		const newQueue = this.getGroupQueue(group);
		let being = limit;

		function xhrFunc(event) {

			switch (event.data.type) {

				case 'onload':
					this.fileLoadedHandler(event.data.res, event.data.el);
					break;

				case 'onprogress':
					event.data.el.downloadedSize = event.data.loaded;

					if (_.get(this).onProgress) _.get(this).onProgress();
					break;
			}
		}

		for (let i = 0; i < newQueue.length; i++) {

			const el = newQueue[i];

			if (el.isLoading) continue;

			const worker = new Worker('worker.js');

			worker.addEventListener('message', xhrFunc);

			el.isLoading = true;
			el.worker = worker;

			worker.postMessage({
				type: 'start',
				el
			});

			being--;

			if (!being) return;
		}
	}

	add(paths) {

		if (Array.isArray(paths)) {

			for (const el of paths) {

				this.addToQueue(el);
			}
		}
		else this.addToQueue(paths);
	}

	start(group) {

		this.getHeaders(group);

		this.startDownload(group);
	}

	stop() {

		for (const el of _.get(this).queue) {

			if (el.isLoading) {

				el.worker.postMessage({
					type: 'stop'
				});

				el.isLoading = false;
			}
		}
	}

	revoke(id, group) {

		for (let i = 0; i < _.get(this).queue.length; i++) {

			const el = _.get(this).queue[i];

			if (!el.blobUrl) continue;

			if (el.id === id && !group) {

				return window.URL.revokeObjectURL(el.blobUrl);
			}
			else if (group && el.group === id) {

				window.URL.revokeObjectURL(el.blobUrl);
			}
		}
	}
}
