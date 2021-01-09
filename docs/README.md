# vsus exports
exports

## groups
- [fromis 9](https://hywn.github.io/vsus/browser?jurl=fromis.json)
- [dreamcatcher](https://hywn.github.io/vsus/browser?jurl=dc.json)
- [idle](https://hywn.github.io/vsus/browser?jurl=idle.json)
- [oh my girl](https://hywn.github.io/vsus/browser?jurl=omg.json)
- [wjsn](https://hywn.github.io/vsus/browser?jurl=wjsn.json)

## info
all groups' scripts aim to generate a list vlives, excluding stuff like v pick!s and prerecorded stuff

all scrape the groups' namu wiki pages (all formatted slightly differently), which are updated manually by volunteers.

the scraped list of 'lives' is then compared against the full list of videos/subs (generated by vsus), packed into a giant JSON object, and saved to `docs/group.json`.

the JSON files can be browsed with `browser.html` (see links above)

## notes
- a lot of groups' namu pages have extra nice info like which members appeared in vlive. didn't scrape because takes work but maybe can include one day

## group-specific notes

### fromis
- fromis's namu page doesn't differentiate between vlives/prerecorded videos, so the script is kinda just straight vsus output
	- could maybe analyze title patterns or json data to filter myb will do one day