var async = require('async');
var fs = require('fs');

var files = [
    'hitters/tg.json',
    'hitters/razzball.json',
    'hitters/rotowire.json',
    'hitters/cbs.json',
    'hitters/fantasypros.json',
    'hitters/steamer.json',
    'hitters/fangraphs.json',
    'hitters/zips.json'
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
        incrementStat(p, stats, counters, "AB");
        incrementStat(p, stats, counters, "PA");
        incrementStat(p, stats, counters, "H");
        incrementStat(p, stats, counters, "1B");
        incrementStat(p, stats, counters, "2B");
        incrementStat(p, stats, counters, "3B");
        incrementStat(p, stats, counters, "HR");
        incrementStat(p, stats, counters, "RBI");
        incrementStat(p, stats, counters, "R");
        incrementStat(p, stats, counters, "SB");
        incrementStat(p, stats, counters, "CS");
        incrementStat(p, stats, counters, "HBP");
        incrementStat(p, stats, counters, "SF");
        incrementStat(p, stats, counters, "BB");
        incrementStat(p, stats, counters, "SO");
        incrementStat(p, stats, counters, "TB");
        incrementStat(p, stats, counters, "AVG");
      });

      Object.keys(stats).forEach(function(key) {
        if(key !== 'name' && counters[key]) {
          
          if(key === 'AVG') stats[key] = Math.round(stats[key]/counters[key]*1000)/1000;
          else stats[key] = Math.round(stats[key]/counters[key]*100)/100;
        }
      });

      results.push(stats);
    });

    _writeJSONFile('hitters/projections.json', results);
    _writeJSONFile('hitters/raw.json', projections);
  });
};

/*var processProjections2 = function(filename) {
  var results = [];
  var count = 0;

  async.map(files, fs.readFile, function(err, data) {
    if(err) throw err;

    data.forEach(function(proj) {
      JSON.parse(proj).forEach(function(player) {

        if(player.AB > 199) {
          if(!projections[player.Name]) {
            projections[player.Name] = [];
            //if(count > 0) console.log("New player found: ", player.Name);
          }
          projections[player.Name].push(player);
        }

      });

      count++;
    });

    Object.keys(projections).forEach(function(player) {
      var stats = {
        AB: 0,
        PA: 0,
        H: 0,
        '1B': 0,
        '2B': 0,
        '3B': 0,
        HR: 0,
        RBI: 0,
        R: 0,
        SB: 0,
        CS: 0,
        HBP: 0,
        SF: 0,
        BB: 0,
        SO: 0,
        TB: 0,
        AVG: 0.0
      };
      stats.name = player;
      projections[player].forEach(function(p) {
        stats.AB += p.AB;
        stats.PA += p.PA;
        stats.H += p.H;
        stats['1B'] += p['1B'];
        stats['2B'] += p['2B'];
        stats['3B'] += p['3B'];
        stats.HR += p.HR;
        stats.RBI += p.RBI;
        stats.R += p.R;
        stats.SB += p.SB;
        stats.CS += p.CS;
        if(p.HBP) stats.HBP += p.HBP;
        if(p.SF) stats.SF += p.SF;
        stats.BB += p.BB;
        if(p.K) stats.SO += p.K;
        if(p.KO) stats.SO += p.KO;
        if(p.SO) stats.SO += p.SO;
        stats.TB += p.TB;
        if(p.AVG) stats.AVG += p.AVG;
        if(p.BA) stats.AVG += p.BA;
      });

      Object.keys(stats).forEach(function(key) {
        if(key !== 'name') {
          if(key === 'AVG') stats[key] = (Math.round(stats[key]/projections[player].length*1000)/1000).toFixed(3);
          else stats[key] = Math.round(stats[key]/projections[player].length);
        }
      });

      results.push(stats);
    });

    _writeJSONFile('hitters/projections.json', results);
    _writeJSONFile('hitters/raw.json', projections);
  });
};*/

var _writeJSONFile = function(filename, data) {
  fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
    if (err) throw err;
    console.log('Saved!');
  });
};

processProjections();