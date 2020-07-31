#!/usr/bin/env -S deno run --allow-read --allow-write

import saving from './saving.js'
const write = path => string => Deno.writeFile(path, new TextEncoder().encode(string))


const { loaded: all_videos } = await saving('F5F127.json')
const subbed_videos = all_videos.filter(video => video.subs)

const table =
'<table>' +
subbed_videos.map(({ title, videoSeq, thumbnail, playTime, subs: { list } }) =>
	`<tr>
		<td><img src=${thumbnail} /></td>
		<td><a href="https://vlive.tv/video/${videoSeq}">${title}</a></td>
		<td>${ list.map(v => v.language).join(', ') }</td>
	</tr>`).join('') +
'</table>'

const style = `<style>
img { width: 10em }
</style>`

const csv = subbed_videos.map(({ title, videoSeq, subs: { list } }) =>
	[title, list.map(v => v.language).join(','), `https://vlive.tv/video/${videoSeq}`]
		.map(str => JSON.stringify(str))
		.join(',')
).join('\n')

await write('test.html')(style + table)
await write('test.csv')(csv)