<?php
require './google-search-results.php';
require './restclient.php';

header('Content-Type: text/html; charset=utf-8');
header('Content-Type: application/json; charset=utf-8');

set_time_limit(1200);

$SERVER_IMAGE_URL = "http://49.212.150.88/uploads/";
$GOOGLE_LENS_KEY = "b5076b0018b5de294717bdaa43e913609574d2ba03a271475b852e45b427e487";

$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$target_file = str_replace(" ","", $target_file);  //Delete whitespace 

$sub_category = $_POST["sub_category"];
$target_search_key = $_POST["search_key"];
$target_Url = $_POST["targetUrl"];


$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

// Check if image file is a actual image or fake image
  $check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);
  if($check !== false) {
    $uploadOk = 1;
  } else {
    $uploadOk = 0;
  }

// Check file size
if ($_FILES["fileToUpload"]["size"] > 500000) {
  echo "Sorry, your file is too large.";
  $uploadOk = 0;
}

// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" ) {
  $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
// if everything is ok, try to upload file
} else {
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {

    // $mercari_pattern = "python ./py_script/mercariSearch.py ";
    
    if ($target_Url == "aucfan") {
        $aucfan_pattern = "python ./py_script/aucfanSearch.py ";
        $cmd = $aucfan_pattern ;

        $command = $cmd . " " . $target_file;
        $command = $command . " " . $sub_category;

        if($target_search_key != "" ){
          $target_search_key = str_replace(" ","", $target_search_key);
          $command = $command . " " . $target_search_key;
        }

        exec($command, $output, $return_code);   
        $response_data = json_encode($output);
        echo $response_data;}
    else {
        $query = [
             "engine" => "google_lens",
             "url" => $SERVER_IMAGE_URL . "01.jpg" ,
        ];

        $search = new GoogleSearch($GOOGLE_LENS_KEY);
        $result = $search->get_json($query);
        $visual_matches = $result->visual_matches;
        for($count = 0; $count < $visual_matches.length; $count++){
          if(strpos($visual_matches[$count]->link, "mercari.com") !== false ) {

            $image_url = $visual_matches[$count]->thumbnail;
            $detail_url = $visual_matches[$count]->link;
            if($visual_matches[$count]->price && $visual_matches[$count]->price->extracted_value){
              $price = $visual_matches[$count]->price->extracted_value;
            }
            else {
              $price = "?";
            }
            echo $image_url;
            echo $detail_url;
            echo $price;
            // var_dump(implode(',', $visual_matches));
          }
        } 
    }


  } 

  else {
    echo "Sorry, there was an error uploading your file.";
  }
}
?>