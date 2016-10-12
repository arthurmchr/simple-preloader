self.addEventListener('message', (event)=> {

	if (event.data.type === 'start') {

		self.xhr = new XMLHttpRequest();
		self.xhr.open('GET', event.data.el.url);
		self.xhr.responseType = 'arraybuffer';

		self.xhr.onload = ()=> {

			if (self.xhr.readyState === self.xhr.DONE) {

				if (self.xhr.status === 200) {

					self.postMessage({
						type: 'onload',
						res: self.xhr.response,
						el: event.data.el
					});
				}
			}

			close();
		};

		self.xhr.onprogress = (eventProgress)=> {

			self.postMessage({
				type: 'onprogress',
				progress: {
					loaded: eventProgress.loaded,
					total: eventProgress.total,
					val: eventProgress.loaded / eventProgress.total
				},
				el: event.data.el
			});
		};

		self.xhr.send();
	}
	else if (event.data.type === 'stop') {

		self.xhr.abort();
		close();
	}
});
