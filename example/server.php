<?php
/**
 * Created by PhpStorm.
 * User: smskin
 * Date: 21.12.16
 * Time: 19:05
 */

$uploadDir = __DIR__.'/temp/';
@mkdir($uploadDir);
$uploadFile = $uploadDir . basename($_FILES['image']['name']);
if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
    print_r(json_encode([
        'result'=>true,
        'id'=>1,
        'image'=>'/temp/'.basename($_FILES['image']['name'])
    ]));
} else {
    echo "Possible file upload attack!\n";
}