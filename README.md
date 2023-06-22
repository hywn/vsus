# vsus

**note: as of 2023 naver vlive is no more**

javascript utility for fetching vlive video info

most useful function is the async `json_from_url`, which given a url to vlive video gives you a lot of info including video streams and caption info

[example info returned by `json_from_url`](https://gist.github.com/hywn/634da502130eff807c3f8a9963b6069a)

## technical notes
the orig/main purpose of vsus is to fetch video caption info. the current method used by vsus is to:
1. scrape json containing relevant `vodId` and `videoSeq` off of video's page (works for both /post/ and /video/ urls)
2. use `videoSeq` to fetch `inkey`
3. use `vodId`, `videoSeq`, and `inkey` to fetch video json data, which includes caption info

this is based on what I observed the actual service do. please let me know if anyone has any better method

[outdated writeup describing old method for old vlive site](https://gist.github.com/hywn/5a06cb56a9773407d745285c83cf3329)

[useful code if you want to quickly fetch a list of all a channel's videos](https://github.com/hywn/vsus/blob/544719c8add185759022d44ecf6cb0d7eee4e1d4/vsus.js#L25-L57) (this uses api that seems to not be used on site anymore? so might not work in future)
