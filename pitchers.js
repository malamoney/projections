var async = require('async');
var fs = require('fs');
var projections = require('./lib/projections');

var projectionFiles = [
  'pitchers/tg.json',
  'pitchers/razzball.json',
  'pitchers/rotowire.json',
  'pitchers/cbs.json',
  'pitchers/fantasypros.json',
  'pitchers/steamer.json',
  'pitchers/fangraphs.json',
  'pitchers/zips.json'
];

var statCategories = [
  'GS', 'IP', 'W', 'L', 'K', 'BB', 'H', 'ER', 'SV', 'ERA', 'WHIP', 'R', 'QS', 'HBP', 'HOLD'
];

projections.processProjections({
  playerType: 'pitchers',
  projectionFiles: projectionFiles,
  statCategories: statCategories
});