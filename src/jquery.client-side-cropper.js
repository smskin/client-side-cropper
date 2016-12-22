/**
 * Created by smskin on 22.12.16.
 */

if (typeof jQuery === 'undefined') {
    throw new Error('This plugin requires jQuery')
}

if (typeof FileAPI === 'undefined') {
    throw new Error('This plugin requires FileAPI plugin. Repository: https://github.com/mailru/FileAPI')
}

(function($) {
    'use strict';
    var version = $.fn.jquery.split(' ')[0].split('.');
    if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1) || (version[0] > 3)) {
        throw new Error('This plugin requires jQuery version 1.9.1 or higher, but lower than version 4')
    }

    if (typeof $.fn.modal === 'undefined') {
        throw new Error('This plugin requires jQuery modal plugin. Optimized for bootstrap modal')
    }

    if (typeof $.fn.fileapi === 'undefined') {
        throw new Error('This plugin requires jquery.fileapi plugin. Repository: https://github.com/RubaXa/jquery.fileapi')
    }

    if (typeof $.fn.Jcrop === 'undefined') {
        throw new Error('This plugin requires jquery.Jcrop plugin. Repository: https://github.com/tapmodo/Jcrop')
    }
})(jQuery);


(function($) {
    'use strict';

    var cropFile;

    function normalizeModal($cropModalDiv,parameters){
        var areaWidth = parameters.newFileWidth+100;
        if (areaWidth < 586){
            areaWidth = 586;
        }
        var marginLeft = areaWidth/2;
        $cropModalDiv.css({
            'left':'50%',
            'margin-left':'-'+marginLeft+'px',
            'width':areaWidth+'px'
        });

        $cropModalDiv.find('.modal-dialog').css({
            'width':areaWidth+'px'
        });

        $cropModalDiv.find('.modal-content').css({
            'height':parameters.newFileHeight+170+'px',
            'width':areaWidth+'px',
            'text-align':'center'
        });

        var $cropNode = $cropModalDiv.find('.js-img');

        $cropNode.css({
            'height':parameters.newFileHeight+'px',
            'width':parameters.newFileWidth+'px',
            'display':'inline-block'
        });
    }

    function calculateParameters(fileInfo,minWidth,minHeight){
        var fileHeight = fileInfo.height;
        var fileWidth = fileInfo.width;
        var maxWindowWidth = $(window).width() - 200;
        var maxWindowHeight = $(window).height() - 250;

        var orientation = 'square';
        var mod = 0;
        var newFileHeight = fileHeight;
        var newFileWidth = fileWidth;
        var newMinWidth = minWidth;
        var newMinHeight = minHeight;
        if (fileHeight > fileWidth){
            orientation = 'vertical';
            if (newFileWidth>maxWindowWidth){
                mod = newFileWidth/maxWindowWidth;
                newFileHeight = newFileHeight/mod;
                newFileWidth = newFileWidth/mod;
                newMinWidth = newMinWidth/mod;
                newMinHeight = newMinHeight/mod;
            }
            if (newFileHeight>maxWindowHeight){
                mod = newFileHeight/maxWindowHeight;
                newFileHeight = newFileHeight/mod;
                newFileWidth = newFileWidth/mod;
                newMinWidth = newMinWidth/mod;
                newMinHeight = newMinHeight/mod;
            }
        }
        if (fileHeight < fileWidth){
            orientation = 'horizontal';
            if (newFileWidth>maxWindowWidth){
                mod = newFileWidth/maxWindowWidth;
                newFileHeight = newFileHeight/mod;
                newFileWidth = newFileWidth/mod;
                newMinWidth = newMinWidth/mod;
                newMinHeight = newMinHeight/mod;
            }
            if (newFileHeight>maxWindowHeight){
                mod = newFileHeight/maxWindowHeight;
                newFileHeight = newFileHeight/mod;
                newFileWidth = newFileWidth/mod;
                newMinWidth = newMinWidth/mod;
                newMinHeight = newMinHeight/mod;
            }
        }
        var aspectRatio = minWidth/minHeight;

        return {
            maxWindowWidth:maxWindowWidth,
            maxWindowHeight:maxWindowHeight,
            fileWidth:fileWidth,
            fileHeight:fileHeight,
            orientation:orientation,
            minWidth:minWidth,
            minHeight:minHeight,
            mod:mod,
            newFileWidth:parseInt(newFileWidth),
            newFileHeight:parseInt(newFileHeight),
            newMinWidth:parseInt(newMinWidth),
            newMinHeight:parseInt(newMinHeight),
            aspectRatio:aspectRatio
        };
    }

    var generatedModalDivCounter = 0;
    var generateCropModalDivOptions = {
        titleText: 'Crop image interface',
        closeBtnText: 'Close',
        saveBtnText: 'Save changes'
    };

    function generateCropModalDiv(options){
        options = generateCropModalDivOptions;
        var id = 'clientSideCropperCropModalDiv_'+generatedModalDivCounter;
        var html =
            '<div class="modal fade client_side_crop_modal_div" id="'+id+'" tabindex="-1" role="dialog" aria-labelledby="'+id+'Label" data-backdrop="static" data-keyboard="false">'+
                '<div class="modal-dialog" role="document">'+
                    '<div class="modal-content">'+
                        '<div class="modal-header">'+
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+
                            '<h4 class="modal-title" id="'+id+'Label">'+ options.titleText +'</h4>'+
                        '</div>'+
                        '<div class="modal-body">'+
                            '<div class="js-img"></div>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                            '<button type="button" class="btn btn-default" data-dismiss="modal">'+ options.closeBtnText +'</button>'+
                            '<button type="submit" class="btn btn-primary js-upload">'+ options.saveBtnText +'</button>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>';
        generatedModalDivCounter++;
        $('body').append(html);
        return id;
    }

    function updateGenerateCropModalDivConfig(args){
        if (args !== undefined){
            if (args.titleText){
                generateCropModalDivOptions.titleText = args.titleText;
            }
            if (args.closeBtnText){
                generateCropModalDivOptions.closeBtnText = args.closeBtnText;
            }
            if (args.saveBtnText){
                generateCropModalDivOptions.saveBtnText = args.saveBtnText;
            }
        }
    }

    var Exceptions = {
        actionUrlRequired: 'Action url required. Use data attribute "data-url" or set in js initialize script',
        cropModalDivNotExists: function(id){
            return 'cropModalDiv not exist (UID: '+id+')';
        },
        flashNotSupported: 'Your browser does not support HTML5 and Flash :(',
        requireMinImageSize: function(minWidth,minHeight){
            return '<p>Файл должен быть изображением.</p><p>Минимальный размер: <strong>'+minWidth+'px</strong> x <strong>'+minHeight+'px</p>'
        },
        uploadedDivNotFount: 'Uploaded div not found. Required element with class .uploaded',
        previewDivNotFount: 'Preview div not found. Required element with class .js-preview',
        serverError: 'При обработке произошла ошибка.<br />Повторите попытку.',
        browseDivNotFount: 'Browse div not found. Required element with class .js-browse',
        fileInputNotFount: 'File input element not found. Required input[type="file"]',
        imageAreaInCropModalDivNotFound: 'Not found image area element in crop modal interface. Require div with class .js-img',
        submitButtonInCropModalDivNotFound: 'Not fount submit button in crop modal interface. Require button[type="submit"]',
        imageTypeNotDefined: 'Image type not defined'
    };

    var defArgs = {
        url:'',
        data:{
            type:'image'
        },
        cropModalDivId: function(){
            return generateCropModalDiv()
        },
        minWidth:200,
        minHeight:200,
        previewHeight:200,
        previewWidth:200,
        onError: function(reason){
            throw new Error(reason);
        },
        onSuccess: function(serverResponse){

        },
        lockModalDivId: 'lockModal'
    };

    function getDataAttributes($cropButton){
        var url = $cropButton.attr('data-action');
        if (url === undefined){
            url = defArgs.url;
        }

        var imageType = $cropButton.attr('data-imageType');
        var data = {
            type: $cropButton.attr('data-imageType')
        };
        if (imageType === undefined){
            data = defArgs.data;
        }

        var minWidth = $cropButton.attr('data-minWidth');
        if (minWidth === undefined){
            minWidth = defArgs.minWidth;
        } else {
            minWidth = parseInt(minWidth);
        }

        var minHeight = $cropButton.attr('data-minHeight');
        if (minHeight === undefined){
            minHeight = defArgs.minHeight;
        } else {
            minHeight = parseInt(minHeight);
        }

        var cropModalDivId = $cropButton.attr('data-cropModalDivId');
        if (cropModalDivId === undefined){
            cropModalDivId = defArgs.cropModalDivId();
        }

        var previewHeight = $cropButton.attr('data-previewHeight');
        if (previewHeight === undefined){
            previewHeight = defArgs.previewHeight;
        } else {
            previewHeight = parseInt(previewHeight);
        }


        var previewWidth = $cropButton.attr('data-previewWidth');
        if (previewWidth === undefined){
            previewWidth = defArgs.previewWidth;
        } else {
            previewWidth = parseInt(previewWidth);
        }

        var lockModalDivId = $cropButton.attr('data-lockModalDivId');
        if (previewWidth === undefined){
            lockModalDivId = defArgs.lockModalDivId;
        }

        var onError = defArgs.onError;
        var onSuccess = defArgs.onSuccess;

        return {
            url:url,
            data:data,
            minWidth:minWidth,
            minHeight:minHeight,
            cropModalDivId:cropModalDivId,
            previewHeight:previewHeight,
            previewWidth:previewWidth,
            lockModalDivId:lockModalDivId,
            onError:onError,
            onSuccess:onSuccess
        }
    }

    function getArguments($cropButton,args){
        var dataAttributes = getDataAttributes($cropButton);
        var url = args.url;
        if (url === undefined){
            url = dataAttributes.url;
        }
        var data = args.data;
        if (data === undefined){
            data = dataAttributes.data;
        }

        var minWidth = args.minWidth;
        if (minWidth === undefined){
            minWidth = dataAttributes.minWidth;
        }

        var minHeight = args.minHeight;
        if (minHeight === undefined){
            minHeight = dataAttributes.minHeight;
        }

        var cropModalDivId = args.cropModalDivId;
        if (cropModalDivId === undefined || cropModalDivId === 'auto'){
            cropModalDivId = dataAttributes.cropModalDivId;
        }

        var previewHeight = args.previewHeight;
        if (previewHeight === undefined){
            previewHeight = dataAttributes.previewHeight;
        }

        var previewWidth = args.previewWidth;
        if (previewWidth === undefined){
            previewWidth = dataAttributes.previewWidth;
        }

        var lockModalDivId = args.lockModalDivId;
        if (lockModalDivId === undefined){
            lockModalDivId = dataAttributes.lockModalDivId;
        }

        var onError = args.onError;
        if (onError === undefined){
            onError = dataAttributes.onError;
        }

        var onSuccess = args.onSuccess;
        if (onSuccess === undefined){
            onSuccess = dataAttributes.onSuccess;
        }

        return {
            url:url,
            data:data,
            minWidth:minWidth,
            minHeight:minHeight,
            cropModalDivId:cropModalDivId,
            previewHeight:previewHeight,
            previewWidth:previewWidth,
            lockModalDivId:lockModalDivId,
            onError:onError,
            onSuccess:onSuccess
        }
    }

    function validateOptions($cropButton,config){
        if (!config.url.length){
            config.onError(Exceptions.actionUrlRequired);
        }

        if (!config.data.type){
            config.onError(Exceptions.imageTypeNotDefined);
        }

        var $cropModalDiv = $('#'+config.cropModalDivId);
        if (!$cropModalDiv.length){
            config.onError(Exceptions.cropModalDivNotExists(config.cropModalDivId));
        }
        var $uploadedDiv = $cropButton.find('.uploaded');
        if (!$uploadedDiv.length){
            config.onError(Exceptions.uploadedDivNotFount);
        }

        var $previewDiv = $cropButton.find('.js-preview');
        if (!$previewDiv.length){
            config.onError(Exceptions.previewDivNotFount);
        }

        var $browseDiv = $cropButton.find('.js-browse');
        if (!$browseDiv.length){
            config.onError(Exceptions.browseDivNotFount);
        }

        var $fileInput = $cropButton.find('input[type="file"]');
        if (!$fileInput.length){
            config.onError(Exceptions.fileInputNotFount);
        }

        var $imageInCropModalDiv = $cropModalDiv.find('.js-img');
        if (!$imageInCropModalDiv.length){
            config.onError(Exceptions.imageAreaInCropModalDivNotFound);
        }

        var $submitButtonInCropModalDiv = $cropModalDiv.find('[type="submit"]');
        if (!$submitButtonInCropModalDiv.length){
            config.onError(Exceptions.submitButtonInCropModalDivNotFound);
        }

    }

    function getOptions($cropButton,args){
        var config;
        if (args !== undefined){
            config = getArguments($cropButton,args);
        } else {
            config = getDataAttributes($cropButton);
        }

        validateOptions($cropButton,config);

        var $uploadedDiv = $cropButton.find('.uploaded');
        $uploadedDiv.css({
            width:config.previewWidth+'px',
            height:config.previewHeight+'px'
        });

        var $previewDiv = $cropButton.find('.js-preview');
        $previewDiv
            .addClass('hide')
            .css({
                width:config.previewWidth+'px',
                height:config.previewHeight+'px'
            });

        var $previewImage = $uploadedDiv.find('img');

        if ($previewImage.length){
            config.previewHeight = $previewImage.height();
            config.previewWidth = $previewImage.width();
        } else {
            if (config.previewHeight === undefined){
                config.previewHeight = defArgs.previewHeight;
            }
            if (config.previewWidth === undefined){
                config.previewWidth = defArgs.previewWidth;
            }
        }

        var $lockModal = $('#'+config.lockModalDivId);

        var $cropModalDiv = $('#'+config.cropModalDivId);

        $cropButton.append('<input type="hidden" name="'+ config.data.type +'">');

        return {
            objects: {
                cropModalDiv: $cropModalDiv,
                cropButton: $cropButton
            },
            url:config.url,
            data: config.data,
            imageAutoOrientation:true,
            accept: 'image/*',
            imageSize: {
                minWidth:config.minWidth,
                minHeight: config.minHeight
            },
            imageTransform: {
                type: 'image/jpeg',
                quality: 1,
                maxWidth: config.minWidth,
                maxHeight: config.minHeight
            },
            imageOriginal:false,
            elements: {
                active: { show: '.js-upload', hide: '.js-browse' },
                preview:false,
                progress: false
            },
            onSelect: function (evt, ui){
                var allfiles = ui.all[0];
                var file = ui.files[0];
                if( !FileAPI.support.transform ) {
                    config.onError(Exceptions.flashNotSupported);
                } else if(file){
                    cropFile = file;
                    FileAPI.getInfo(cropFile, function (err/**String*/, info/**Object*/) {
                        var parameters = calculateParameters(info,config.minWidth,config.minHeight);
                        FileAPI.Image(cropFile)
                            .resize(parameters.newFileWidth, parameters.newFileHeight)
                            .get(function (err/**String*/, img/**HTMLElement*/){
                                $cropModalDiv
                                    .find('.js-img')
                                    .html(img);

                                normalizeModal($cropModalDiv,parameters);

                                $uploadedDiv.addClass('hide');
                                $previewDiv.removeClass('hide');
                                $cropModalDiv.modal('show');
                            });
                    });
                } else if (allfiles) {
                    FileAPI.getInfo(allfiles, function (){
                        config.onError(Exceptions.requireMinImageSize(config.minWidth,config.minHeight));
                    })
                }
            },
            onUpload: function(){
                if ($lockModal.length){
                    $lockModal.modal('show');
                }
            },
            onFileComplete: function(evt,uiEvt){
                if (!uiEvt.error){
                    if (uiEvt.result.result){
                        var id = uiEvt.result.id;
                        $cropButton.find('input[name="'+ config.data.type +'"]').val(id);
                        var src = uiEvt.result.image;
                        $uploadedDiv
                            .html('<img src="'+src+'" style="height:'+config.previewHeight+'px; width:'+config.previewWidth+'px" />')
                            .removeClass('hide');
                        $previewDiv
                            .addClass('hide');
                        $cropModalDiv.modal('hide');
                        config.onSuccess(uiEvt.result);
                    } else {
                        $cropModalDiv.modal('hide');
                        config.onError(uiEvt.result.reason)
                    }
                } else {
                    $cropModalDiv.modal('hide');
                    config.onError(Exceptions.serverError);
                }
                if ($lockModal.length){
                    $lockModal.modal('hide');
                }
            }
        };
    }

    function initCropper(options){
        FileAPI.getInfo(cropFile, function (err/**String*/, info/**Object*/) {
            var $cropModalDiv = options.objects.cropModalDiv;
            var $cropButton = options.objects.cropButton;

            var parameters = calculateParameters(info,options.imageSize.minWidth,options.imageSize.minHeight);
            $('.js-img canvas', $cropModalDiv).Jcrop({
                aspectRatio: parameters.aspectRatio,
                bgFade: true,
                bgOpacity: .5,
                handleOpacity: 0.7,
                createHandles: ['nw', 'ne', 'se', 'sw'],
                borderOpacity: 0,
                keySupport: false,
                minSize: [parameters.minWidth, parameters.minHeight],
                file: cropFile,
                setSelect:   [
                    (parameters.fileWidth / 2) - parameters.minWidth/2,
                    (parameters.fileHeight /2) - parameters.minHeight/2,
                    (parameters.fileWidth / 2) + parameters.minWidth/2,
                    (parameters.fileHeight / 2) + parameters.minHeight/2
                ],
                trueSize: [parameters.fileWidth,parameters.fileHeight],
                onSelect: function (coords) {
                    $cropButton.fileapi('crop', cropFile, coords);
                }
            });
        });
    }

    function triggers(options){
        var $cropModalDiv = options.objects.cropModalDiv;
        var $cropButton = options.objects.cropButton;

        $cropModalDiv.on('shown.bs.modal', function () {
            initCropper(options);
        });
        $cropModalDiv.on('click','button[type="submit"]',function(){
            $cropButton.fileapi('upload');
        });

        $cropModalDiv.on('hidden.bs.modal', function () {
            $cropButton.find('div.uploaded').removeClass('hide');
            $cropButton.find('div.js-preview').addClass('hide');
            $cropModalDiv.find('canvas').remove();
        });
    }

    function initialize(args){
        var $cropButton = $(this);
        var options = getOptions($cropButton,args);
        $cropButton.fileapi(options);
        triggers(options);
    }

    function updateClientSideCropperConfig(config,args){
        switch (config){
            case 'generateCropModalDivOptions':
                updateGenerateCropModalDivConfig(args);
                break;
        }
    }

    jQuery.fn.extend({
        clientSideCropper:initialize,
        clientSideCropperConfig:updateClientSideCropperConfig
    });
})(jQuery);

//(function($) {
//    $(document).ready(function(){
//        $.fn.clientSideCropperConfig(
//            'generateCropModalDivOptions',
//            {
//                titleText: '1title',
//                closeBtnText: '2Exit',
//                saveBtnText: '3submit'
//            }
//        );
//        $('#imageDiv1').clientSideCropper({
//            url:'ctrl.php',
//            data:{
//                type:'rectangle'
//            },
//            cropModalDivId: 'auto',
//            minWidth:200,
//            minHeight:200,
//            previewHeight:200,
//            previewWidth:200,
//            onError: function(reason){
//                alert(reason)
//            },
//            onSuccess: function(serverResponse){
//                console.log(serverResponse)
//            },
//            lockModalDivId: 'lockModal'
//        });
//        $('#imageDiv2').clientSideCropper();
//    })
//})(jQuery);