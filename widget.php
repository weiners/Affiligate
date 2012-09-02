<?php
require_once("lib/Wix.php");
require_once("lib/AmazonLayer.php");
include_once("lib/jssdk.phtml");

try
{
    $accessKey = "AKIAIKSFWOLBYUR5ZXDQ";
    $secretKey = "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";
    $associateTag = "pfb03-20";
    $amazon = new AmazonLayer($accessKey, $secretKey, $associateTag);
    $wix = new Wix();
    $instance = $wix->getDecodedInstance();
    $componentId = $_GET['compId'];
    $asin = $_GET['asin'];
    $layoutName = $_GET['layoutName'];
    $layoutSettings = $_GET['layoutSettings'];
    // Direct render mode
    if (isset($asin) && isset($layoutName) && isset($layoutSettings)) {
        renderWidget($asin, $layoutName, $layoutSettings);
    } else
    // Widget from DB render mode
    if (isset($componentId) && isset($instance) && isset($instance["instanceId"])) {
        $sql = mysql_connect("localhost", "root", "affiligate");
        if ($sql) {
            $selected = mysql_select_db("affiligate", $sql);
            if ($selected) {
                $query = sprintf("SELECT * FROM widgets WHERE component_id='%s' AND instance_id='%s'", mysql_real_escape_string($componentId), mysql_real_escape_string($instance["instanceId"]));
                $result = mysql_query($query);
                if ($result) {
                    $rowCount = mysql_num_rows($result);
                    if ($rowCount==0) {
                        // get default widget
                        $query = sprintf("SELECT * FROM widgets WHERE component_id='%s'", "default");
                        $result = mysql_query($query);
                    }
                    $row = mysql_fetch_array($result, true);
                    renderWidget($row["amazon_asin"], $row["layout_name"], $row["layout_settings"]);
                    mysql_close($sql);

                } else {
                    die("Invalid query: " . mysql_error());
                }
            } else {
                die ("Can't select database: ". mysql_error());
            }
        } else {
            die ("DB Error:" . mysql_error());
        }
    } else {
        die ("Missing Component ID or Instance ID");
    }
}

catch(Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
}

function renderWidget($asin, $layoutName, $layoutSettings) {
    global $amazon;
    global $associateTag;
    $product = $amazon->getProduct((string)$asin);


    $content = json_decode($layoutSettings, true);
    switch ($content["size"]) {
        case "Small":
            $content["amazonSize"] = "_SL110_";
            break;
        case "Large":
            $content["amazonSize"] = "_SL160_";
            break;
    }
    $content["size"] = strtolower($content["size"]);
    include('Container.phtml');
}