if (document.getElementById('video_player') == null) {
	setTimeout(function() {
		if (document.getElementById('video_player') == null) {
			document.querySelector('.btn.btn-standard.btn-watch.btn-block.btn-live-strm').click();
		}
	}, 5000)
}
