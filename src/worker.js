self.addEventListener('message', (event)=> {

	if (event.data.type === 'start') {

		self.xhr = new XMLHttpRequest();
		self.xhr.open('GET', event.data.el.url);

		self.xhr.onload = (res)=> {

			self.postMessage({
				type: 'onload',
				res,
				el: event.data.el
			});

			close();
		};

		self.xhr.onprogress = (eventProgress)=> {

			self.postMessage({
				type: 'onprogress',
				loaded: eventProgress.loaded,
				el: event.data.el
			});
		};
	}
	else if (event.data.type === 'stop') {

		self.xhr.abort();
		close();
	}
});
