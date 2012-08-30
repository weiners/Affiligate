<?php
require_once("lib/Wix.php");
require_once("lib/AmazonLayer.php");
require_once("lib/jssdk.phtml");
require_once("lib/analytics.phtml");


/**
 * Created by JetBrains PhpStorm.
 * User: shayw
 * Date: 8/29/12
 * Time: 2:41 PM
 * To change this template use File | Settings | File Templates.
 */
$wix = new Wix();
$instance = $wix->getDecodedInstance();
//echo print_r($instance, true);

//echo 'cmop '.$_GET['compId'];


include("settingsUI.phtml");


//assert user own component




//render settings