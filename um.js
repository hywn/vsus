const channel_seq =
	code => {
		const half = Math.ceil(code.length / 2)
		const shuf = code.substring(half, code.length) + code.substring(0, half);
		return (parseInt(shuf, 16) + 13) / 8191
	}

const get_page =
	(seq, page) =>
		fetch(`https://api-vfan.vlive.tv/v2/channel.${seq}/home?app_id=8c6cc7b45d2568fb668be6e05b6e5a3b${page ? `&next=${page}` : ''}`)
			.then(r => r.json())

const get =
	async (seq, until_vseq) => {
		const videos = []
		let curr_page = null

		while (true) {
			const { contentList, page: { next } } = await get_page(seq, curr_page)

			videos.push(...contentList)
			curr_page = next

			console.log(`next: ${next}`)

			if (contentList.length === 0)
				break

			const found_vseq = contentList.findIndex(vid => vid.videoSeq === until_vseq)
			if (found_vseq !== -1) {
				videos.length = found_vseq
				break
			}
		}

		return videos
	}

import saving from './saving.js'

const update =
	async code => {

		const { save, loaded: old_videos } = await saving(`${code}.json`, [])

		const last_seq = (old_videos[0] || {}).videoSeq

		const new_videos = await get(channel_seq(code), last_seq)

		console.log(`got ${new_videos.length} new videos`)

		if (new_videos.length !== 0)
			save([...new_videos, ...old_videos])

	}

//const seq = channel_seq('BAE889')

//console.log(await get(seq, 198894))

await update('CE2621')