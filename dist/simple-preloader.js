(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SimplePreloader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var SimplePreloader = function () {
	function SimplePreloader() {
		var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

		var _ref$concurent = _ref.concurent;
		var concurent = _ref$concurent === undefined ? 6 : _ref$concurent;
		var _ref$headers = _ref.headers;
		var headers = _ref$headers === undefined ? false : _ref$headers;
		var _ref$onComplete = _ref.onComplete;
		var onComplete = _ref$onComplete === undefined ? null : _ref$onComplete;
		var _ref$onProgress = _ref.onProgress;
		var onProgress = _ref$onProgress === undefined ? null : _ref$onProgress;

		_classCallCheck(this, SimplePreloader);

		this.xhrFunc = this.xhrFunc.bind(this);

		this._concurent = concurent;
		this._headers = headers;
		this._onComplete = onComplete;
		this._onProgress = onProgress;

		this._queue = [];

		this._inlineBlob = URL.createObjectURL(new Blob(["self.addEventListener('message', (event)=> {\n\n\tif (event.data.type === 'start') {\n\n\t\tself.xhr = new XMLHttpRequest();\n\t\tself.xhr.open('GET', event.data.el.url);\n\t\tself.xhr.responseType = 'arraybuffer';\n\n\t\tself.xhr.onload = ()=> {\n\n\t\t\tif (self.xhr.readyState === self.xhr.DONE) {\n\n\t\t\t\tif (self.xhr.status === 200) {\n\n\t\t\t\t\tself.postMessage({\n\t\t\t\t\t\ttype: 'onload',\n\t\t\t\t\t\tres: self.xhr.response,\n\t\t\t\t\t\tel: event.data.el\n\t\t\t\t\t});\n\t\t\t\t}\n\t\t\t}\n\n\t\t\tclose();\n\t\t};\n\n\t\tself.xhr.onprogress = (eventProgress)=> {\n\n\t\t\tself.postMessage({\n\t\t\t\ttype: 'onprogress',\n\t\t\t\tprogress: {\n\t\t\t\t\tloaded: eventProgress.loaded,\n\t\t\t\t\ttotal: eventProgress.total,\n\t\t\t\t\tval: eventProgress.loaded / eventProgress.total\n\t\t\t\t},\n\t\t\t\tel: event.data.el\n\t\t\t});\n\t\t};\n\n\t\tself.xhr.send();\n\t}\n\telse if (event.data.type === 'stop') {\n\n\t\tself.xhr.abort();\n\t\tclose();\n\t}\n});\n"], { type: 'application/javascript' }));
	}

	_createClass(SimplePreloader, [{
		key: 'add',
		value: function add(paths) {

			if (Array.isArray(paths)) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {

					for (var _iterator = paths[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var el = _step.value;


						this.addToQueue(el);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}
			} else this.addToQueue(paths);
		}
	}, {
		key: 'addToQueue',
		value: function addToQueue(file) {

			var item = void 0;

			if (typeof file === 'string') {

				item = {
					url: file
				};
			} else {

				item = file;
			}

			if (!item.id) item.id = item.url;

			item.isLoading = false;
			item.progress = null;
			item.totalSize = 0;
			item.blobUrl = null;

			this._queue.push(item);
		}
	}, {
		key: 'start',
		value: function start(group) {

			if (this._headers) this.getHeaders(group);

			this.startDownload(group);
		}
	}, {
		key: 'getHeaders',
		value: function getHeaders(group) {
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				var _loop = function _loop() {
					var el = _step2.value;


					if (el.blobUrl || el.totalSize) return 'continue';

					var xhr = new XMLHttpRequest();
					xhr.open('HEAD', el.url);

					xhr.onload = function () {

						el.totalSize = xhr.getResponseHeader('Content-Length');
					};

					xhr.send();
				};

				for (var _iterator2 = this.getGroupQueue(group)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var _ret = _loop();

					if (_ret === 'continue') continue;
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}
		}
	}, {
		key: 'getGroupQueue',
		value: function getGroupQueue(group) {

			return group ? this._queue.filter(this.filterByGroup(group)) : this._queue;
		}
	}, {
		key: 'filterByGroup',
		value: function filterByGroup(group) {

			return function (el) {

				return el.group === group;
			};
		}
	}, {
		key: 'startDownload',
		value: function startDownload() {
			var group = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._concurent;


			var newQueue = this.getGroupQueue(group);
			var being = limit;

			for (var i = 0; i < newQueue.length; i++) {

				var _el = newQueue[i];

				if (_el.isLoading || _el.blobUrl) continue;

				var worker = new Worker(this._inlineBlob);

				worker.addEventListener('message', this.xhrFunc);

				_el.isLoading = true;
				_el.worker = worker;

				worker.postMessage({
					type: 'start',
					el: {
						id: _el.id,
						url: _el.url
					}
				});

				being--;

				if (being === 0) return;
			}
		}
	}, {
		key: 'xhrFunc',
		value: function xhrFunc(event) {

			var el = this.getElById(event.data.el.id);

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
	}, {
		key: 'getElById',
		value: function getElById(id) {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {

				for (var _iterator3 = this._queue[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _el2 = _step3.value;


					if (_el2.id === id) return _el2;
				}
			} catch (err) {
				_didIteratorError3 = true;
				_iteratorError3 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion3 && _iterator3.return) {
						_iterator3.return();
					}
				} finally {
					if (_didIteratorError3) {
						throw _iteratorError3;
					}
				}
			}
		}
	}, {
		key: 'fileLoadedHandler',
		value: function fileLoadedHandler(res, el) {

			el.worker.terminate();
			delete el.worker;

			el.isLoading = false;
			el.blobUrl = URL.createObjectURL(new Blob([event.data.res], { type: 'image/jpeg' }));

			var status = this.getStatus(el.group);

			if (status.notStarted) this.startDownload(el.group, 1);else if (!status.notFinished && this._onComplete) this._onComplete(el);
		}
	}, {
		key: 'getStatus',
		value: function getStatus(group) {

			var notStarted = 0;
			var notFinished = 0;

			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = this.getGroupQueue(group)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var _el3 = _step4.value;


					if (!_el3.isLoading && !_el3.blobUrl) notStarted++;else if (_el3.isLoading) notFinished++;
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return {
				notStarted: notStarted,
				notFinished: notFinished
			};
		}
	}, {
		key: 'stop',
		value: function stop() {
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {

				for (var _iterator5 = this._queue[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var _el4 = _step5.value;


					if (_el4.isLoading) {

						_el4.worker.postMessage({
							type: 'stop'
						});

						_el4.worker.terminate();
						delete _el4.worker;

						_el4.isLoading = false;
						_el4.progress = null;
					}
				}
			} catch (err) {
				_didIteratorError5 = true;
				_iteratorError5 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion5 && _iterator5.return) {
						_iterator5.return();
					}
				} finally {
					if (_didIteratorError5) {
						throw _iteratorError5;
					}
				}
			}
		}
	}, {
		key: 'getResult',
		value: function getResult(id) {

			var blob = this.getElById(id).blobUrl;

			return blob;
		}

		// revoke(id, group) {

		// 	for (let i = 0; i < this._queue.length; i++) {

		// 		const el = this._queue[i];

		// 		if (!el.blobUrl) continue;

		// 		if (el.id === id && !group) {

		// 			return window.URL.revokeObjectURL(el.blobUrl);
		// 		}
		// 		else if (group && el.group === id) {

		// 			window.URL.revokeObjectURL(el.blobUrl);
		// 		}
		// 	}
		// }

		// destroy() {


		// }

	}]);

	return SimplePreloader;
}();

exports.default = SimplePreloader;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvU2ltcGxlUHJlbG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLElBQU0sS0FBSyxRQUFRLElBQVIsQ0FBWDs7SUFFcUIsZTtBQUVwQiw0QkFLUTtBQUFBLGlGQUFKLEVBQUk7O0FBQUEsNEJBSlAsU0FJTztBQUFBLE1BSlAsU0FJTyxrQ0FKSyxDQUlMO0FBQUEsMEJBSFAsT0FHTztBQUFBLE1BSFAsT0FHTyxnQ0FIRyxLQUdIO0FBQUEsNkJBRlAsVUFFTztBQUFBLE1BRlAsVUFFTyxtQ0FGTSxJQUVOO0FBQUEsNkJBRFAsVUFDTztBQUFBLE1BRFAsVUFDTyxtQ0FETSxJQUNOOztBQUFBOztBQUVQLE9BQUssT0FBTCxHQUFlLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBZjs7QUFFQSxPQUFLLFVBQUwsR0FBa0IsU0FBbEI7QUFDQSxPQUFLLFFBQUwsR0FBZ0IsT0FBaEI7QUFDQSxPQUFLLFdBQUwsR0FBbUIsVUFBbkI7QUFDQSxPQUFLLFdBQUwsR0FBbUIsVUFBbkI7O0FBRUEsT0FBSyxNQUFMLEdBQWMsRUFBZDs7QUFFQSxPQUFLLFdBQUwsR0FBbUIsSUFBSSxlQUFKLENBQW9CLElBQUksSUFBSixDQUFTLENBQUMsR0FBRyxZQUFILENBQW1CLFNBQW5CLGlCQUEwQyxNQUExQyxDQUFELENBQVQsRUFBOEQsRUFBQyxNQUFNLHdCQUFQLEVBQTlELENBQXBCLENBQW5CO0FBQ0E7Ozs7c0JBRUcsSyxFQUFPOztBQUVWLE9BQUksTUFBTSxPQUFOLENBQWMsS0FBZCxDQUFKLEVBQTBCO0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUV6QiwwQkFBaUIsS0FBakIsOEhBQXdCO0FBQUEsVUFBYixFQUFhOzs7QUFFdkIsV0FBSyxVQUFMLENBQWdCLEVBQWhCO0FBQ0E7QUFMd0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FB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InNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaW1wbGVQcmVsb2FkZXIge1xuXG5cdGNvbnN0cnVjdG9yKHtcblx0XHRjb25jdXJlbnQgPSA2LFxuXHRcdGhlYWRlcnMgPSBmYWxzZSxcblx0XHRvbkNvbXBsZXRlID0gbnVsbCxcblx0XHRvblByb2dyZXNzID0gbnVsbFxuXHR9ID0ge30pIHtcblxuXHRcdHRoaXMueGhyRnVuYyA9IHRoaXMueGhyRnVuYy5iaW5kKHRoaXMpO1xuXG5cdFx0dGhpcy5fY29uY3VyZW50ID0gY29uY3VyZW50O1xuXHRcdHRoaXMuX2hlYWRlcnMgPSBoZWFkZXJzO1xuXHRcdHRoaXMuX29uQ29tcGxldGUgPSBvbkNvbXBsZXRlO1xuXHRcdHRoaXMuX29uUHJvZ3Jlc3MgPSBvblByb2dyZXNzO1xuXG5cdFx0dGhpcy5fcXVldWUgPSBbXTtcblxuXHRcdHRoaXMuX2lubGluZUJsb2IgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtmcy5yZWFkRmlsZVN5bmMoYCR7X19kaXJuYW1lfS93b3JrZXIuanNgLCAndXRmOCcpXSwge3R5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J30pKTtcblx0fVxuXG5cdGFkZChwYXRocykge1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocGF0aHMpKSB7XG5cblx0XHRcdGZvciAoY29uc3QgZWwgb2YgcGF0aHMpIHtcblxuXHRcdFx0XHR0aGlzLmFkZFRvUXVldWUoZWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHRoaXMuYWRkVG9RdWV1ZShwYXRocyk7XG5cdH1cblxuXHRhZGRUb1F1ZXVlKGZpbGUpIHtcblxuXHRcdGxldCBpdGVtO1xuXG5cdFx0aWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xuXG5cdFx0XHRpdGVtID0ge1xuXHRcdFx0XHR1cmw6IGZpbGVcblx0XHRcdH07XG5cdFx0fVxuXHRcdGVsc2Uge1xuXG5cdFx0XHRpdGVtID0gZmlsZTtcblx0XHR9XG5cblx0XHRpZiAoIWl0ZW0uaWQpIGl0ZW0uaWQgPSBpdGVtLnVybDtcblxuXHRcdGl0ZW0uaXNMb2FkaW5nID0gZmFsc2U7XG5cdFx0aXRlbS5wcm9ncmVzcyA9IG51bGw7XG5cdFx0aXRlbS50b3RhbFNpemUgPSAwO1xuXHRcdGl0ZW0uYmxvYlVybCA9IG51bGw7XG5cblx0XHR0aGlzLl9xdWV1ZS5wdXNoKGl0ZW0pO1xuXHR9XG5cblx0c3RhcnQoZ3JvdXApIHtcblxuXHRcdGlmICh0aGlzLl9oZWFkZXJzKSB0aGlzLmdldEhlYWRlcnMoZ3JvdXApO1xuXG5cdFx0dGhpcy5zdGFydERvd25sb2FkKGdyb3VwKTtcblx0fVxuXG5cdGdldEhlYWRlcnMoZ3JvdXApIHtcblxuXHRcdGZvciAoY29uc3QgZWwgb2YgdGhpcy5nZXRHcm91cFF1ZXVlKGdyb3VwKSkge1xuXG5cdFx0XHRpZiAoZWwuYmxvYlVybCB8fCBlbC50b3RhbFNpemUpIGNvbnRpbnVlO1xuXG5cdFx0XHRjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0XHRcdHhoci5vcGVuKCdIRUFEJywgZWwudXJsKTtcblxuXHRcdFx0eGhyLm9ubG9hZCA9ICgpPT4ge1xuXG5cdFx0XHRcdGVsLnRvdGFsU2l6ZSA9IHhoci5nZXRSZXNwb25zZUhlYWRlcignQ29udGVudC1MZW5ndGgnKTtcblx0XHRcdH07XG5cblx0XHRcdHhoci5zZW5kKCk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0R3JvdXBRdWV1ZShncm91cCkge1xuXG5cdFx0cmV0dXJuIGdyb3VwID8gdGhpcy5fcXVldWUuZmlsdGVyKHRoaXMuZmlsdGVyQnlHcm91cChncm91cCkpIDogdGhpcy5fcXVldWU7XG5cdH1cblxuXHRmaWx0ZXJCeUdyb3VwKGdyb3VwKSB7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oZWwpIHtcblxuXHRcdFx0cmV0dXJuIGVsLmdyb3VwID09PSBncm91cDtcblx0XHR9O1xuXHR9XG5cblx0c3RhcnREb3dubG9hZChncm91cCA9IG51bGwsIGxpbWl0ID0gdGhpcy5fY29uY3VyZW50KSB7XG5cblx0XHRjb25zdCBuZXdRdWV1ZSA9IHRoaXMuZ2V0R3JvdXBRdWV1ZShncm91cCk7XG5cdFx0bGV0IGJlaW5nID0gbGltaXQ7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG5ld1F1ZXVlLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGNvbnN0IGVsID0gbmV3UXVldWVbaV07XG5cblx0XHRcdGlmIChlbC5pc0xvYWRpbmcgfHwgZWwuYmxvYlVybCkgY29udGludWU7XG5cblx0XHRcdGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIodGhpcy5faW5saW5lQmxvYik7XG5cblx0XHRcdHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgdGhpcy54aHJGdW5jKTtcblxuXHRcdFx0ZWwuaXNMb2FkaW5nID0gdHJ1ZTtcblx0XHRcdGVsLndvcmtlciA9IHdvcmtlcjtcblxuXHRcdFx0d29ya2VyLnBvc3RNZXNzYWdlKHtcblx0XHRcdFx0dHlwZTogJ3N0YXJ0Jyxcblx0XHRcdFx0ZWw6IHtcblx0XHRcdFx0XHRpZDogZWwuaWQsXG5cdFx0XHRcdFx0dXJsOiBlbC51cmxcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGJlaW5nLS07XG5cblx0XHRcdGlmIChiZWluZyA9PT0gMCkgcmV0dXJuO1xuXHRcdH1cblx0fVxuXG5cdHhockZ1bmMoZXZlbnQpIHtcblxuXHRcdGNvbnN0IGVsID0gdGhpcy5nZXRFbEJ5SWQoZXZlbnQuZGF0YS5lbC5pZCk7XG5cblx0XHRzd2l0Y2ggKGV2ZW50LmRhdGEudHlwZSkge1xuXG5cdFx0XHRjYXNlICdvbmxvYWQnOlxuXHRcdFx0XHR0aGlzLmZpbGVMb2FkZWRIYW5kbGVyKGV2ZW50LmRhdGEucmVzLCBlbCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdvbnByb2dyZXNzJzpcblx0XHRcdFx0ZWwucHJvZ3Jlc3MgPSBldmVudC5kYXRhLnByb2dyZXNzO1xuXG5cdFx0XHRcdGlmICh0aGlzLl9vblByb2dyZXNzKSB0aGlzLl9vblByb2dyZXNzKGV2ZW50LmRhdGEucHJvZ3Jlc3MpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRnZXRFbEJ5SWQoaWQpIHtcblxuXHRcdGZvciAoY29uc3QgZWwgb2YgdGhpcy5fcXVldWUpIHtcblxuXHRcdFx0aWYgKGVsLmlkID09PSBpZCkgcmV0dXJuIGVsO1xuXHRcdH1cblx0fVxuXG5cdGZpbGVMb2FkZWRIYW5kbGVyKHJlcywgZWwpIHtcblxuXHRcdGVsLndvcmtlci50ZXJtaW5hdGUoKTtcblx0XHRkZWxldGUgZWwud29ya2VyO1xuXG5cdFx0ZWwuaXNMb2FkaW5nID0gZmFsc2U7XG5cdFx0ZWwuYmxvYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2V2ZW50LmRhdGEucmVzXSwge3R5cGU6ICdpbWFnZS9qcGVnJ30pKTtcblxuXHRcdGNvbnN0IHN0YXR1cyA9IHRoaXMuZ2V0U3RhdHVzKGVsLmdyb3VwKTtcblxuXHRcdGlmIChzdGF0dXMubm90U3RhcnRlZCkgdGhpcy5zdGFydERvd25sb2FkKGVsLmdyb3VwLCAxKTtcblx0XHRlbHNlIGlmICghc3RhdHVzLm5vdEZpbmlzaGVkICYmIHRoaXMuX29uQ29tcGxldGUpIHRoaXMuX29uQ29tcGxldGUoZWwpO1xuXHR9XG5cblx0Z2V0U3RhdHVzKGdyb3VwKSB7XG5cblx0XHRsZXQgbm90U3RhcnRlZCA9IDA7XG5cdFx0bGV0IG5vdEZpbmlzaGVkID0gMDtcblxuXHRcdGZvciAoY29uc3QgZWwgb2YgdGhpcy5nZXRHcm91cFF1ZXVlKGdyb3VwKSkge1xuXG5cdFx0XHRpZiAoIWVsLmlzTG9hZGluZyAmJiAhZWwuYmxvYlVybCkgbm90U3RhcnRlZCsrO1xuXHRcdFx0ZWxzZSBpZiAoZWwuaXNMb2FkaW5nKSBub3RGaW5pc2hlZCsrO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRub3RTdGFydGVkLFxuXHRcdFx0bm90RmluaXNoZWRcblx0XHR9O1xuXHR9XG5cblx0c3RvcCgpIHtcblxuXHRcdGZvciAoY29uc3QgZWwgb2YgdGhpcy5fcXVldWUpIHtcblxuXHRcdFx0aWYgKGVsLmlzTG9hZGluZykge1xuXG5cdFx0XHRcdGVsLndvcmtlci5wb3N0TWVzc2FnZSh7XG5cdFx0XHRcdFx0dHlwZTogJ3N0b3AnXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGVsLndvcmtlci50ZXJtaW5hdGUoKTtcblx0XHRcdFx0ZGVsZXRlIGVsLndvcmtlcjtcblxuXHRcdFx0XHRlbC5pc0xvYWRpbmcgPSBmYWxzZTtcblx0XHRcdFx0ZWwucHJvZ3Jlc3MgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldFJlc3VsdChpZCkge1xuXG5cdFx0Y29uc3QgYmxvYiA9IHRoaXMuZ2V0RWxCeUlkKGlkKS5ibG9iVXJsO1xuXG5cdFx0cmV0dXJuIGJsb2I7XG5cdH1cblxuXHQvLyByZXZva2UoaWQsIGdyb3VwKSB7XG5cblx0Ly8gXHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3F1ZXVlLmxlbmd0aDsgaSsrKSB7XG5cblx0Ly8gXHRcdGNvbnN0IGVsID0gdGhpcy5fcXVldWVbaV07XG5cblx0Ly8gXHRcdGlmICghZWwuYmxvYlVybCkgY29udGludWU7XG5cblx0Ly8gXHRcdGlmIChlbC5pZCA9PT0gaWQgJiYgIWdyb3VwKSB7XG5cblx0Ly8gXHRcdFx0cmV0dXJuIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKGVsLmJsb2JVcmwpO1xuXHQvLyBcdFx0fVxuXHQvLyBcdFx0ZWxzZSBpZiAoZ3JvdXAgJiYgZWwuZ3JvdXAgPT09IGlkKSB7XG5cblx0Ly8gXHRcdFx0d2luZG93LlVSTC5yZXZva2VPYmplY3RVUkwoZWwuYmxvYlVybCk7XG5cdC8vIFx0XHR9XG5cdC8vIFx0fVxuXHQvLyB9XG5cblx0Ly8gZGVzdHJveSgpIHtcblxuXG5cdC8vIH1cbn1cbiJdfQ==
