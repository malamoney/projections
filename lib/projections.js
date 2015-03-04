var async = require('async');
var fs = require('fs');

var writeJSONFile = function(filename, data) {
  fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
    if (err) throw err;
    console.log('Saved: ', filename);
  });
};

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

var process = function(playerType, projectionFiles, statCategories, statsHandlers) {
  var projections = {}; // Container for projections
  var results = []; // Final array to contain averaged stats for each player

  // Read in each stats JSON file
  async.map(projectionFiles, fs.readFile, function(err, data) {
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
        statCategories.forEach(function(cat) {
          incrementStat(p, stats, counters, cat.toUpperCase());
        });
      });

      Object.keys(stats).forEach(function(key) {
        if(key !== 'name' && counters[key]) {
          
          if(statsHandlers && statsHandlers[key]) stats[key] = statsHandlers[key](stats[key]/counters[key]);
          else stats[key] = Math.round(stats[key]/counters[key]*100)/100;
        }
      });

      results.push(stats);
    });

    writeJSONFile(playerType + '/projections.json', results);
    writeJSONFile(playerType + '/raw.json', projections);
  });
};

var stats = {
  processProjections: function(params) {
    if(params.playerType === undefined) throw new Error('Missing player type...');
    if(params.projectionFiles === undefined || !params.projectionFiles.length) throw new Error('Missing projection files...');

    process(params.playerType, params.projectionFiles, params.statCategories, params.statsHandlers);
  }
};

module.exports = stats;