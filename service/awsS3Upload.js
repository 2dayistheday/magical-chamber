var formidable = require('formidable');
var AWS = require('aws-sdk');
var key = require('../config/keys.js');

var Upload = {};
AWS.config.region = 'ap-northeast-2';

var s3 = new AWS.S3();

var form = new formidable.IncomingForm({
    encoding: 'utf-8',
    multiples: true,
    keepExtensions: false
});
var params = {
    Bucket: key.awsBucketName,
    Key: null,
    ACL: 'public-read',
    Body: null
};

Upload.formidable = function (req, callback) {
    form.parse(req, function (err, fields, files) {
    });

    form.on('error', function (err) {
        callback(err, null);
    });
    form.on('end', function () {
        callback(null, this.openedFiles);
    });
    form.on('aborted', function () {
        callback('form.on(aborted)', null);
    });
};
Upload.s3 = function (files, path, callback) {
    params.Key = path + files[0].name;
    params.Body = require('fs').createReadStream(files[0].path);
    s3.upload(params, function (err, result) {
        callback(err, result);
    });
};

Upload.profile = function (files, path, callback) {
    params.Key = path + 'pic';
    params.Body = require('fs').createReadStream(files[0].path);
    s3.upload(params, function (err, result) {
        callback(err, result);
    });
};

module.exports = Upload;