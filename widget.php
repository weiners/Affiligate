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
                        $row = mysql_fetch_array($result, true);
                    } else {
                        $row = mysql_fetch_array($result, true);
                    }
                    $product = $amazon->getProduct((string)$row["amazon_asin"]);
                    $content = json_decode($row["layout_settings"], true);
                    switch ($content["size"]) {
                        case "Small":
                            $content["size"] = "_SL110_";
                            break;
                        case "Large":
                            $content["size"] = "_SL160_";
                            break;
                    }
                    include('Container.phtml');
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
