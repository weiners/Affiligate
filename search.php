<?php
/**
 * Created by JetBrains PhpStorm.
 * User: RoyK
 * Date: 8/29/12
 * Time: 5:55 PM
 */

require_once("lib/AmazonLayer.php");
$accessKey = "AKIAIKSFWOLBYUR5ZXDQ";
$secretKey = "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";
$associateTag = "pfb03-20";
$amazon = new AmazonLayer($accessKey, $secretKey, $associateTag);
$resultContent = new stdClass;
if (isset($_GET["keywords"]) && isset($_GET["searchIndex"])) {
    $results = $amazon->search($_GET["keywords"], $_GET["searchIndex"]);
    $resultContent->payLoad = $results;
    $resultContent->success = true;
} else {
    $resultContent->success = false;
    $resultContent->message = "No search params";
    // no enough search params
}
echo json_encode($resultContent);