var async = require('async');
var fs = require('fs');

var files = [
    'pitchers/tg.json',
    'pitchers/razzball.json',
    'pitchers/cbs.json',
    'pitchers/fantasypros.json',
    'pitchers/steamer.json',
    'pitchers/fangraphs.json',
    'pitchers/rotowire.json',
    'pitchers/zips.json'
  ];

var projections = {};

var incrementStat = function(player, stats, counters, statKey, actualKey) {
  var stat = player[statKey] || player[statKey.toLowerCase()];

  // Check if the stat and counter have been initialized
  if(!stats[statKey]) stats[statKey] = 0;
  if(!counters[statKey]) counters[statKey] = 0;

  // If the current stat exists in the stat group
  if(stat !== undefined) {

    // Increment the stat and counter
    stats[statKey] += stat;
    counters[statKey]++;
  }
};

var processProjections = function(filename) {
  var results = []; // Final array to contain averaged stats for each player

  // Read in each stats JSON file
  async.map(files, fs.readFile, function(err, data) {
    if(err) throw err;

    // Iterate over each stats JSON file
    data.forEach(function(proj) {

      // Parse the data as JSON and iterate over each player
      JSON.parse(proj).forEach(function(player) {

        // Check if the player already has an entry in the master projections object. If not, create one
        if(!projections[player.Name]) {
          projections[player.Name] = [];
        }

        // Add the player stats to the player's array of stats in the master object
        projections[player.Name].push(player);
      });
    });

    // Iterate over each player in the master projections list
    Object.keys(projections).forEach(function(player) {
      var stats = {}; // Container for player's averaged stats
      var counters = {}; // Container for counters for each type of stat

      stats.name = player;

      // Iterate over each set of stats for the current player and sum them up
      projections[player].forEach(function(p) {
        incrementStat(p, stats, counters, "GS");
        incrementStat(p, stats, counters, "IP");
        incrementStat(p, stats, counters, "W");
        incrementStat(p, stats, counters, "L");
        incrementStat(p, stats, counters, "K");
        incrementStat(p, stats, counters, "BB");
        incrementStat(p, stats, counters, "H");
        incrementStat(p, stats, counters, "ER");
        incrementStat(p, stats, counters, "ERA");
        incrementStat(p, stats, counters, "WHIP");
        incrementStat(p, stats, counters, "SV");
        incrementStat(p, stats, counters, "R");
        incrementStat(p, stats, counters, "QS");
        incrementStat(p, stats, counters, "HBP");
        incrementStat(p, stats, counters, "HOLD");
      });

      Object.keys(stats).forEach(function(key) {
        if(key !== 'name' && counters[key]) {
          
          stats[key] = Math.round(stats[key]/counters[key]*100)/100;
        }
      });

      results.push(stats);
    });

    _writeJSONFile('pitchers/projections.json', results);
    _writeJSONFile('pitchers/raw.json', projections);
  });
};

var _writeJSONFile = function(filename, data) {
  fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
    if (err) throw err;
    console.log('Saved!');
  });
};

processProjections();