#Client side crop image interface based on MailRu FileApi and Bootstrap Modal

**Author(s):**
* Sergey Mikhaylov, smskin@rkmail.ru

## Requirements
1. jQuery plugin >= 3.1.1
2. Bootstrap >= 3.3.7
3. JqueryFileApi >= 0.4.11 (https://github.com/RubaXa/jquery.fileapi/)

You can install this components with bower.

## Usage

### Step 1: Install required components
```
bower install
```
Or download required components manually.

### Step 2: Connect components to page
```
 <link type="text/css" rel="stylesheet" href="/bower_components/bootstrap/dist/css/bootstrap.min.css" />
 <link type="text/css" rel="stylesheet" href="/bower_components/bootstrap/dist/css/bootstrap-theme.min.css" />
 <link type="text/css" rel="stylesheet" href="/bower_components/jquery.fileapi/jcrop/jquery.Jcrop.min.css" />

 <script type="text/javascript" src="/bower_components/jquery/dist/jquery.min.js"></script>
 <script type="text/javascript" src="/bower_components/jquery.fileapi/FileAPI/FileAPI.min.js"></script>
 <script type="text/javascript" src="/bower_components/jquery.fileapi/FileAPI/FileAPI.exif.js"></script>
 <script type="text/javascript" src="/bower_components/jquery.fileapi/jquery.fileapi.min.js"></script>
 <script type="text/javascript" src="/bower_components/jquery.fileapi/jcrop/jquery.Jcrop.min.js"></script>
 <script type="text/javascript" src="/dist/jquery.client-side-cropper.min.js"></script>
```

### Step3: Add html template to page
You can set params in data attributes or on initialize plugin

Html attributes:
```
    data-action - Server action url
    data-imageType - Attribute is the name of the image. This attribute is sent to the server when you change the image. There will also be created a input with the title, which will be inserted into the image ID is stored on the server.
    data-minWidth - Minimal width of image
    data-minHeight - Minimal height of image
    data-previewHeight - Preview image height. This image inserting to .uploaded div after sended to server.
    data-previewWidth - Preview image width
    data-lockModalDivId - Additional attribute. Script can lock interface then image sending to server
    data-cropModalDivId - Additional attribute. You can customize default modal for cropping. If not specified or = auto - the script will generate a modal with parent class .client_side_crop_modal_div
```
If you use initialization with config in js code - use attributes without data prefix
```
<div id="elementWithDataAttributes" class="fileinput fileinput-new"
    data-action="server.php"
    data-imageType="circle"
    data-minWidth="400"
    data-minHeight="400"
    data-previewHeight = "200"
    data-previewWidth = "200"
    data-lockModalDivId="lockModal"
    data-cropModalDivId="customCropModalDiv"
>
    <div class="fileinput-preview thumbnail uploaded"></div>
    <div class="fileinput-preview thumbnail js-preview"></div>
    <div class="js-fileapi-wrapper">
        <span class="btn btn-default btn-file js-browse">
        <span class="fileinput-new">Select image</span>
            <input type="file" name="image" accept="image/*">
        </span>
    </div>
</div>
```
```
<div id="elementWithoutDataAttributes" class="fileinput fileinput-new">
    <div class="fileinput-preview thumbnail uploaded"></div>
    <div class="fileinput-preview thumbnail js-preview"></div>
    <div class="js-fileapi-wrapper">
        <span class="btn btn-default btn-file js-browse">
        <span class="fileinput-new">Select image</span>
            <input type="file" name="image" accept="image/*">
        </span>
    </div>
</div>
```
You can use other structure of code. But this classes required:
```
Crop image button:
    .uploaded - Div for uploaded image
    .js-preview - Div for preview image
    .js-browse - Div for file input
    input[type="file"] - File input
Crop image modal div:
    .js-img - Div for cropping image
```
### Step4: Activate plugin
You can use data attributes or set config. Also you can max data attributes with config.
```
  $('#elementWithDataAttributes').clientSideCropper();

  $('#elementWithoutDataAttributes').clientSideCropper({
    url:'server.php',
    data:{
        type:'image3'
    },
    cropModalDivId: 'auto',
    minWidth:400,
    minHeight:400,
    previewHeight:200,
    previewWidth:200,
    onError: function(reason){
        alert(reason)
    },
    onSuccess: function(serverResponse){
        console.log(serverResponse)
    },
    lockModalDivId: 'lockModal'
  });

  $('#elementWithDataAttributesAndConfig').clientSideCropper({
     onError: function(reason){
        alert(reason)
     },
     onSuccess: function(serverResponse){
        console.log(serverResponse)
     }
  });
```
### Step5: Working
1. When you click on the button - activated the file selection dialog.
2. After selecting a file to open a modal window for modification.
3. When you click to save the next request to the server to be sent to:
```
    {
        type: imageType,
        image: file
    }
```
4. The server must save the image and return the following response:
```
    {
        result: true,
        id: UID of file in temp table for insert to input[name="imageType"].
        image: Image url for insert to div.uploaded
    }
```
5. A modal window is closed. The field input[name="imageType"] will be inserted into the UID image in div .uploaded image will be inserted.
6. You can save the form. On the server will pass parameters to the UID image