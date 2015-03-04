var async = require('async');
var fs = require('fs');
var projections = require('./lib/projections');

var projectionFiles = [
  'hitters/tg.json',
  'hitters/razzball.json',
  'hitters/rotowire.json',
  'hitters/cbs.json',
  'hitters/fantasypros.json',
  'hitters/steamer.json',
  'hitters/fangraphs.json',
  'hitters/zips.json'
];

var statCategories = [
  'AB', 'PA', 'H', '1B', '2B', '3B', 'HR', 'RBI', 'R', 'SB', 'CS', 'HBP', 'SF', 'BB', 'SO', 'TB', 'AVG'
];

projections.processProjections({
  playerType: 'hitters',
  projectionFiles: projectionFiles,
  statCategories: statCategories,
  statsHandlers: {
    'AVG': function(stats) {
      return Math.round(stats*1000)/1000;
    }
  }
});