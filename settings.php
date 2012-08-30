<?php
require_once("lib/Wix.php");
require_once("lib/AmazonLayer.php");
require_once("lib/jssdk.phtml");
require_once("lib/analytics.phtml");
require_once("lib/AffiligateLib.php");


/**
 * Created by JetBrains PhpStorm.
 * User: shayw
 * Date: 8/29/12
 * Time: 2:41 PM
 * To change this template use File | Settings | File Templates.
 */
$wix = new Wix();
$instance = $wix->getDecodedInstance();
$affiligate = new AffiligateLib();
$userId = $instance['uid'];
$instanceId = $instance['instanceId'];
$permission = $instance["permission"];
$componentId = $_GET['origCompId'];
$sql = mysql_connect("localhost", "root", "affiligate");
$widgetData = "";
$userData = "";
if (isset($componentId)) {
    $rs = $affiligate->doesInstanceBelongToUser($sql, $instanceId, $userId, true);
    if ($rs["success"]==true) {
        $rs["success"] = false;
        // Get widget options
        $query = sprintf("SELECT * FROM widgets WHERE component_id='%s' AND instance_id='%s'", mysql_real_escape_string($componentId), mysql_real_escape_string($instance["instanceId"]));
        $result = mysql_query($query);
        if ($result) {
            $rowCount = mysql_num_rows($result);

            if ($rowCount>0) {
                $row = mysql_fetch_array($result, true);
                if (!isset($row["product_info"])) {
                    $row["product_info"] = "{}";
                }
                $widgetData = array();
                $widgetData["asin"] = $row["amazon_asin"];
                $widgetData["layoutName"] = $row["layout_name"];

                $a1 = json_decode(print_r($row["layout_settings"], true));
                $widgetData["layoutSettings"] = $a1;
                $a2 = json_decode(print_r($row["product_info"], true));
                $widgetData["productInfo"] = $a2;
            }
        }
        // Get user options
        $query = sprintf("SELECT * FROM users WHERE user_id='%s'", mysql_real_escape_string($userId));
        $result = mysql_query($query);
        if (!$result) {
            $rs["message"] = "Unknown DB error when fetching user: ". mysql_error();
            die(json_encode($rs));
        }
        $rowCount = mysql_num_rows($result);
        if ($rowCount>0) {
            $row = mysql_fetch_array($result, true);
            $userData = new stdClass();
            $userData->userSettings = json_decode($row["user_settings"]);
        }
    }
}
mysql_close($sql);


include("settingsUI.phtml");

