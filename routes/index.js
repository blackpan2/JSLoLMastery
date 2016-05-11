var express = require('express');
var LolApi = require('leagueapi');
var moment = require("moment");

var router = express.Router();

LolApi.init(process.env.DEV_KEY, 'na'); // Dev key is stored in environment for protection
// LolApi.setRateLimit(1500, 90000); // When using a Riot production key
LolApi.setRateLimit(10, 500); // When using a Riot development key

router.get('/', function (req, res) {
    res.render('index', {title: 'League Mastery'});
});

router.post('/', function (req, res) {
    res.status(302).redirect("/summoner=" + req.body.summoner);
});

function merge_options(obj1, obj2) {
    var obj3 = {};
    for (var attrName1 in obj1) {
        obj3[attrName1] = obj1[attrName1];
    }
    for (var attrName2 in obj2) {
        obj3[attrName2] = obj2[attrName2];
    }
    return obj3;
}

function compare(a, b) {
    if (a.championPoints > b.championPoints) return -1;
    else if (a.championPoints < b.championPoints) return 1;
    else if (a.championPoints == b.championPoints) {
        if (a.key > b.key) return -1;
        else if (a.key < b.key) return 1;
    }
    else return 0;
}

router.get('/summoner=:summoner', function (req, res) {
    console.log("Going to: '" + req.params.summoner + "'");
    LolApi.Summoner.getByName(req.params.summoner, function (err) {
        if (err) {
            console.log(err);
            res.render('summoner-notfound', {title: 'Not found', name: req.params.summoner});
        }
        if (!err) {
            LolApi.Summoner.getByName(req.params.summoner).then(function (summoner) {
                var masteryData = [];
                var tempMastery = [];
                var tempChampions = [];
                summoner = summoner[Object.keys(summoner)[0]];
                var str = summoner.name;
                var first = str.slice(0, 1).toUpperCase();
                var second = str.slice(1).toLowerCase();
                summoner.name = first + second;
                summoner.iconURL = 'http://ddragon.leagueoflegends.com/cdn/6.9.1/img/profileicon/' + summoner.profileIconId + '.png';
                LolApi.ChampionMastery.getChampions(summoner.id).then(function (mastery) {
                    tempMastery = mastery;
                    for (var mast in tempMastery) {
                        tempMastery[mast]['masteryPicture'] = "/images/tier" + tempMastery[mast]['championLevel'] + ".png";
                        tempMastery[mast]['lastPlayTime'] = moment(tempMastery[mast]['lastPlayTime']).format("MMM DD YYYY, h:mm a");
                    }
                }).then(function () {
                    var options = {champData: 'lore', locale: 'en_US'};
                    LolApi.Static.getChampionList(options).then(function (championList) {
                        tempChampions = Object.keys(championList.data).map(function (key) {
                            return championList.data[key]
                        });
                        for (var champ in tempChampions) {
                            tempChampions[champ]['championPicture'] = "http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/"
                                + tempChampions[champ].key + ".png";
                        }
                    }).then(function () {
                        for (var i = 0; i < tempChampions.length; i++) {
                            for (var j = 0; j < tempMastery.length; j++) {
                                if (tempChampions[i].id === tempMastery[j].championId) {
                                    masteryData.push(merge_options(tempChampions[i], tempMastery[j]));
                                }
                            }
                        }
                        masteryData = masteryData.sort(compare);
                        res.render('summoner-mastery', {
                            title: "League Mastery: " + summoner.name,
                            summoner: summoner,
                            mastery: masteryData
                        });
                    });
                });
            })
        }
    });
});

router.get('/summoner=:summoner/champion=:champion', function (req, res) {
    res.render('summoner-champion', {title: req.params.summoner + " " + req.params.champion });
});

module.exports = router;
