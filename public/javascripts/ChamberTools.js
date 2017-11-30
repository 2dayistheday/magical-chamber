//
// var user_id = prompt("사용자 ID를 입력하세요", "default");
// var chamber_name = prompt("소속된 챔버명을 입력하세요", "redpoint");

var user_id;
var chamber_name;

//calling canvas
(function( $ ){
    $.fn.canvas = function() {
        var iFrameLink = '<iframe id="canvas"';
            iFrameLink = iFrameLink + 'src="https://canvas-redpoint.herokuapp.com/?chamber=' +chamber_name;
            iFrameLink = iFrameLink + '&userName=' + user_id;
            iFrameLink = iFrameLink +'" width="' + '100%';//settings.width;
            iFrameLink = iFrameLink +'" height="' + '100%;';//settings.height;
            iFrameLink = iFrameLink +'"></iframe>';

        var $iFrameLink = $(iFrameLink);

        var $self = this;
        $self.html(iFrameLink);
    };

})( jQuery );

//calling etherpad
(function( $ ){

    $.fn.pad = function( options ) {
        var settings = {
            //'host'              : 'http://beta.etherpad.org',
            'host'              : ' https://agile-springs-86898.herokuapp.com',
            'baseUrl'           : '/p/',
            'userName'          : user_id,
            'lang'              : '',
            'userColor'         : true,
            'padId'             : chamber_name    };

        var $self = this;
        if (!$self.length) return;
        if (!$self.attr('id')) throw new Error('No "id" attribute');

        var selfId = $self.attr('id');
        var epframeId = 'epframe'+ selfId;
        // This writes a new frame if required
        if ( !options.getContents ) {
            if ( options ) {
                $.extend( settings, options );
            }

            var pluginParams = '';
            for(var option in settings.plugins) {
                pluginParams += '&' + option + '=' + settings.plugins[option]
            }

            var iFrameLink = '<iframe id="'+epframeId;
            iFrameLink = iFrameLink +'" name="' + epframeId;
            iFrameLink = iFrameLink +'" src="' + settings.host+settings.baseUrl+settings.padId;
            iFrameLink = iFrameLink + '?showChat=false';
            iFrameLink = iFrameLink + '&userName=' + settings.userName;
            iFrameLink = iFrameLink + '&userColor=' + settings.userColor;
            iFrameLink = iFrameLink +';" width="' + '100%';//settings.width;
            iFrameLink = iFrameLink +'" height="' + '100%;';//settings.height;
            iFrameLink = iFrameLink +'"></iframe>';

            var $iFrameLink = $(iFrameLink);
            $self.html(iFrameLink);
        }
        // This reads the etherpad contents if required
        else {
            var frameUrl = $('#'+ epframeId).attr('src').split('?')[0];
            var contentsUrl = frameUrl + "/export/html";
            var target = $('#'+ options.getContents);

            // perform an ajax call on contentsUrl and write it to the parent
            $.get(contentsUrl, function(data) {

                if (target.is(':input')) {
                    target.val(data).show();
                }
                else {
                    target.html(data);
                }

                $('#'+ epframeId).remove();
            });
        }
        return $self;
    };
})( jQuery );

//calling canvas
