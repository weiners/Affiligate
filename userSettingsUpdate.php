<?php

require_once("lib/Wix.php");
require_once("lib/AffiligateLib.php");

$wix = new Wix();
$affiligate = new AffiligateLib();
$instance = $wix->getDecodedInstance();

$userId = $instance['uid'];
$instanceId = $instance['instanceId'];
$permission = $instance["permission"];

$sql = mysql_connect("localhost", "root", "affiligate");

$rs = $affiligate->doesInstanceBelongToUser($sql, $instanceId, $userId, true);

if ($rs["success"]==true) {
    $rs["success"] = false;
    // If we got here, then the user is the owner of the instance
    // Then, insert/set the settings into the user table
    if (!isset($_GET['userSettings'])) {
        $rs["message"] = "Missing user settings parameter";
        die(json_encode($rs));
    }
    $userSettings = $_GET['userSettings'];

    $query = sprintf("SELECT * FROM users WHERE user_id='%s'", mysql_real_escape_string($userId));
    $result = mysql_query($query);
    if (!$result) {
        $rs["message"] = "Unknown DB error when fetching user: ". mysql_error();
        die(json_encode($rs));
    }
    $rowCount = mysql_num_rows($result);
    if ($rowCount>0) {  // user already exists, just update their settings
        $query = sprintf("UPDATE users SET user_settings='%s' WHERE  user_id='%s'", mysql_real_escape_string($userSettings), mysql_real_escape_string($userId));
    } else { // user doesn't exist, we need to create their entry.
        $columns = "user_id,user_settings,wix_permissions";
        $data = $affiligate->createInsertData(array($userId, $userSettings, $permission));
        $query = sprintf("INSERT INTO users (%s) VALUES (%s)", $columns, $data);
    }
    $result = mysql_query($query);
    if (!$result){
        $rs["message"] = "Can't update user settings - Unknown DB error: ". mysql_error();
        die(json_encode($rs));
    }
    // If we got here, user settings were updated.
    $rs["success"] = true;
    $rs["message"] = "User settings saved";
}
mysql_close($sql);
die(json_encode($rs));








