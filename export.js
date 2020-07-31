#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

import saving from './saving.js'
const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))


const { loaded: all_videos } = await saving('F5F127.json')
const subbed_videos = all_videos.filter(video => video.subs)

const style =`<style>img { width: 10em }</style>`
const to_tr =
	({ title, videoSeq, thumbnail, playTime, subs: { list } }) =>
	`<tr>
		<td><img src=${thumbnail} /></td>
		<td><a href="https://vlive.tv/video/${videoSeq}">${title}</a></td>
		<td>${ list.map(v => v.language).join(', ') }</td>
	</tr>`
const to_table =
	videos => `<table>${videos.map(to_tr).join('')}</table>` + style

const to_csv_row =
	({ title, videoSeq, subs: { list } }) =>
		[title, list.map(v => v.language).join(','), `https://vlive.tv/video/${videoSeq}`]
			.map(str => JSON.stringify(str))
			.join(',')
const to_csv =
	videos => videos.map(to_csv_row).join('\n')

/// namu ///
const namu = await fetch('https://namu.wiki/w/우주소녀/V LIVE').then(r => r.text())
const live_ids = namu.match(/2\.\d\.<\/a>.+?\d{4}년.+?<\/table>/g)
	.map(year => year.match(/(?<=href='https:\/\/www\.vlive\.tv\/video\/)\d+/g))
	.flat()
	.map(x => +x)

const subbed_lives = subbed_videos.filter(v => live_ids.includes(v.videoSeq))

await write('wjsn/subbed.html')(to_table(subbed_videos))
await write('wjsn/subbed_lives.html')(to_table(subbed_lives))
await write('wjsn/subbed.csv')(to_csv(subbed_videos))
await write('wjsn/subbed_lives.csv')(to_csv(subbed_lives))