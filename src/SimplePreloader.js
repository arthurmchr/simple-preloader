const fs = require('fs');

export default class SimplePreloader {

	constructor({
		concurent = 6,
		headers = false,
		onComplete = null,
		onProgress = null
	} = {}) {

		this.xhrFunc = this.xhrFunc.bind(this);

		this._concurent = concurent;
		this._headers = headers;
		this._onComplete = onComplete;
		this._onProgress = onProgress;

		this._queue = [];
		this._group = null;

		this._inlineBlob = URL.createObjectURL(new Blob([fs.readFileSync(`${__dirname}/worker.js`, 'utf8')], {type: 'application/javascript'}));
	}

	add(paths) {

		if (Array.isArray(paths)) {

			for (const el of paths) {

				this.addToQueue(el);
			}
		}
		else this.addToQueue(paths);
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

		if (!item.type) {

			const ext = item.url.split('.');
			item.type = ext.length > 1 ? ext.pop() : null;
		}

		item.isLoading = false;
		item.progress = null;
		item.totalSize = 0;
		item.blobUrl = null;

		this._queue.push(item);
	}

	start(group) {

		this._group = group;

		if (this._headers) this.getHeaders(group);

		this.startDownload(group);
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

	getGroupQueue(group) {

		return group ? this._queue.filter(this.filterByGroup(group)) : this._queue;
	}

	filterByGroup(group) {

		return function(el) {

			return el.group === group;
		};
	}

	startDownload(group = null, limit = this._concurent) {

		const newQueue = this.getGroupQueue(group);
		let being = limit;

		for (let i = 0; i < newQueue.length; i++) {

			const el = newQueue[i];

			if (el.isLoading || el.blobUrl) continue;

			const worker = new Worker(this._inlineBlob);

			worker.addEventListener('message', this.xhrFunc);

			el.isLoading = true;
			el.worker = worker;

			worker.postMessage({
				type: 'start',
				el: {
					id: el.id,
					url: el.url,
					type: el.type
				}
			});

			being--;

			if (being === 0) return;
		}
	}

	xhrFunc(event) {

		const el = this.getElById(event.data.el.id);

		switch (event.data.type) {

			case 'onload':
				this.fileLoadedHandler(event.data.res, el);
				break;

			case 'onprogress':
				el.progress = event.data.progress;

				if (this._onProgress) this._onProgress(event.data.progress);
				break;
		}
	}

	getElById(id) {

		for (const el of this._queue) {

			if (el.id === id) return el;
		}
	}

	fileLoadedHandler(res, el) {

		el.worker.terminate();

		el.isLoading = false;

		if (el.type === 'json') {

			el.blobUrl = event.data.res;
		}
		else {

			let mimetype = '';

			switch (el.type) {

				case 'jpg':
					mimetype = 'image/jpeg';
					break;

				case 'png':
					mimetype = 'image/png';
					break;

				case 'mp3':
					mimetype = 'audio/mpeg';
					break;

				case 'webm':
					mimetype = 'video/webm';
					break;

				case 'mp4':
					mimetype = 'video/mp4';
					break;
			}

			el.blobUrl = URL.createObjectURL(new Blob([event.data.res], {type: mimetype}));
		}

		const status = this.getStatus(this._group);

		if (status.notStarted) this.startDownload(this._group, 1);
		else if (status.notStarted === 0 && status.notFinished === 0 && this._onComplete) this._onComplete();
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

	stop() {

		for (const el of this._queue) {

			if (el.isLoading) {

				el.worker.postMessage({
					type: 'stop'
				});

				el.worker.terminate();

				el.isLoading = false;
				el.progress = null;
			}
		}
	}

	getResult(id) {

		return this.getElById(id).blobUrl;
	}

	revoke(id, group) {

		for (const el of this._queue) {

			// if not the correct id or group

			if (id && el.id !== id || group && el.group !== group) continue;

			// if no blob or json typed

			if (!el.blobUrl || el.type === 'json') {

				// if id we stop loop

				if (id) return;

				continue;
			}

			if (id) return window.URL.revokeObjectURL(el.blobUrl);
			else window.URL.revokeObjectURL(el.blobUrl);
		}
	}

	destroy() {

		this.stop();
		this.revoke();
	}
}
