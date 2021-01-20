const info_from_url =
	url =>
		fetch(url)
			.then(r => r.text())
			.then(t => t.match(/(?<=window\.__PRELOADED_STATE__=).+?(?=,function)/s)[0])
			.then(t => JSON.parse(t))

const inkey_from_info =
	({ postDetail: { post: { officialVideo: { videoSeq } } } }) =>
		// originally had an appId prob doesnt matter though
		fetch(`https://www.vlive.tv/globalv-web/vam-web/video/v1.0/vod/${videoSeq}/inkey`, {
			headers: { referer: `https://www.vlive.tv/video/${videoSeq}` }
		}).then(r => r.json())

const json_from_info_inkey =
	({ postDetail: { post: { officialVideo: { vodId } } } }, { inkey }) =>
		fetch(`https://apis.naver.com/rmcnmv/rmcnmv/vod/play/v2.0/${vodId}?key=${inkey}`)
			.then(r => r.json())

const json_from_url =
	async url => {
		const info = await info_from_url(url)
		const inkey = await inkey_from_info(info)
		return await json_from_info_inkey(info, inkey)
	}

export { info_from_url, inkey_from_info, json_from_info_inkey, json_from_url }