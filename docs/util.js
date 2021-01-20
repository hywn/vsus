import { info_from_url, inkey_from_info, json_from_info_inkey } from '../vsus.js'

const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))

// 3 => [1, 2, 3, 4, 5, 6, 7] => [[1, 2, 3], [4, 5, 6], [7]]
const group = n => array => new Array(Math.ceil(array.length / n)).fill(0).map((_, i) => array.slice(i * n, (i + 1) * n))

// int => (a => Promise b) => [a] => Promise [b]
// except that itll do it in groups so no more than n will be processed async at once
const group_map_promise = n => f => async ar => {
	const res = []
	for (const grp of group(n)(ar)) {
		console.log('--------- doing group ---------')
		while (true) {
			try {
				res.push(...await Promise.all(grp.map(f)))
			} catch (_) {
				console.log('rejected... trying again')
				continue
			}
			console.log(`${grp.length} OK`)
			break
		}
	}
	return res
}

// note: may return null if video was removed or some other error
const pack = async url => {
	const info = await info_from_url(url)
	if (info.postDetail.error) {
		console.error(url, info.postDetail.error)
		return null
	}
	const inkey = await inkey_from_info(info)
	const json = await json_from_info_inkey(info, inkey)

	const { postDetail: { post: { officialVideo } } } = info

	if (json.captions)
		officialVideo.subs = json.captions

	delete officialVideo.recommendedVideos

	return officialVideo
}

const default_group_map_promise = group_map_promise(250)(pack)

export { write, group, group_map_promise, pack, default_group_map_promise }