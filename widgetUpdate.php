<?php

require_once("lib/Wix.php");
require_once("lib/AffiligateLib.php");


$wix = new Wix();
$instance = $wix->getDecodedInstance();
$affiligate = new AffiligateLib();

//assert user is owner of instance or if not exists create user and or instance
$userId = $instance['uid'];
$instanceId = $instance['instanceId'];

$sql = mysql_connect("localhost", "root", "affiligate");
$rs = $affiligate->doesInstanceBelongToUser($sql, $instanceId, $userId, true);
if ($rs["success"]==true) {
    $rs["success"] = false;
    //update the component
    $componentId = $_GET['compId'];
    $layoutName = $_GET['layoutName'];
    $layoutSettings = $_GET['layoutSettings'];
    $asin = $_GET['asin'];
    if (!isset($componentId) || !isset($layoutName) || !isset($layoutSettings) || !isset($asin) ) {
        $rs["message"] = "Missing arguments";
        die(json_encode($rs));
    }
    // If we got here, then the user is the owner of the instance
    // Then, find the instance ID and update/create it.
    $query = sprintf("SELECT * FROM widgets WHERE component_id='%s' AND instance_id='%s'", mysql_real_escape_string($componentId), mysql_real_escape_string($instanceId));
    $result = mysql_query($query);
    if (!$result) {
        $rs["message"] = "DB Error: " . mysql_error();
        die(json_encode($rs));
    }
    $rowCount = mysql_num_rows($result);
    if ($rowCount>0) {
        // update existing widget
        $query = sprintf("UPDATE widgets SET layout_name='%s', layout_settings='%s', amazon_asin='%s' WHERE component_id='%s' AND instance_id='%s'", mysql_real_escape_string($layoutName), mysql_real_escape_string($layoutSettings), mysql_real_escape_string($asin), mysql_real_escape_string($componentId), mysql_real_escape_string($instanceId));
    } else {
        $columns = "component_id,instance_id,layout_name,amazon_asin,layout_settings";
        $data = $affiligate->createInsertData(array($componentId, $instanceId, $layoutName, $asin, $layoutSettings));
        $query = sprintf("INSERT INTO widgets (%s) VALUES (%s)", $columns, $data);
    }
    $result = mysql_query($query);
    if (!$result) {
        $rs["message"] = "Can't update widget: " . mysql_error();
    }
    $rs["success"] = true;
    $rs["message"] = "ok";

}
die(json_encode($rs));
mysql_close($sql);







