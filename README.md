# vsus
get vlive subs

## description
naver vlive does not (as of aug 2020) offer any convenient way of viewing a channel's videos and available subtitles.

vsus offers interface to naver API with technique [described here](https://gist.github.com/hywn/5a06cb56a9773407d745285c83cf3329).

## usage
`vsus.js` exports one function `update_subs(channel_code, limit=false) -> [video]`.
- `channel_code`: the vlive 'channel code' e.g. `'CE2621'`
- `limit`: optional, when set to a number will only fetch `limit` videos
	- mainly for debugging/development purposes

it returns array of videos, which have a lot of extra information that might be useful to you, but for main purpose of vsus, contains `subs` attribute which contains subs info.

## examples
I have misc `export_aaaa.js` scripts that all use `vsus` to export the data in some format.

an example is [`./export_idle.js`](./export_idle.js); it does the following:
- gets list of all gidle vlives and their subs from vlive
- gets list of livestream vlives by scraping fan-generated info from gidle namu wiki page
- exports all livestream vlives sub info in an HTML file to be comfortably viewed

## technical notes
- each call of `update_subs` completely generates the whole video list from nothing
	- earlier non-async versions cached which video infos you already had and would not update them, but sometimes people go back and sub old vlives so was not ideal.
- getting the list of all videos without subs is not that expensive
	- you can get it paged at 100+ videos in one request, so even for channel that has 1000 vids is only 10 requests
- getting the list of all videos with subs is pretty expensive
	- each video requires 2 requests to get subs info for (this was shortest way I could find)
		- so for 1000 vids you have to make 2000 requests
			- and this runs literally every time you run the script
	- atm there is slight bug where naver will reject you or something and script exits with error. should prob fix
	- even though expensive actually quite fast with async `fetch` (and naver's generosity)
		- but still makes me a bit uncomfortable making 2000 requests
		- async stuff must be grouped into big blocking calls to avoid opening too many file descriptors