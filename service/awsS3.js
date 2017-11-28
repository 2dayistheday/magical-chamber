var formidable = require('formidable');
var AWS = require('aws-sdk');
var key = require('../config/keys.js');

var s3Conn = {};
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

s3Conn.formidable = function (req, callback) {
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
s3Conn.upload = function (files, path) {
    params.Key = path + files[0].name;
    params.Body = require('fs').createReadStream(files[0].path);
    s3.upload(params, function (err, result) {
        //callback(err, result);
    });
};

s3Conn.profile = function (files, path, callback) {
    params.Key = path + 'pic';
    params.Body = require('fs').createReadStream(files[0].path);
    s3.upload(params, function (err, result) {
        callback(err, result);
    });
};

s3Conn.getlist = function (path, callback) {
    s3.listObjects({Bucket: key.awsBucketName, Prefix: path}).on('success', function handlePage(response) {
        for(var name in response.data.Contents){
            console.log(response.data.Contents[name]);
        }
        callback(JSON.stringify(response.data.Contents));
        if (response.hasNextPage()) {
            response.nextPage().on('success', handlePage).send();
        }
    }).send();
};


module.exports = s3Conn;