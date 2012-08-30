<?php
if (!class_exists("AmazonLayer")) {
    Class AmazonLayer {
        var $_key       = "";
        var $_secret    = "";
        var $_associateTag = "";

        var $_baseUrl = "http://webservices.amazon.com/onca/xml";
        var $_version = "2011-08-01";

        function AmazonLayer($key, $secret, $associateTag) {
            $this->_associateTag = $associateTag;
            $this->_key = $key;
            $this->_secret = $secret;
        }

        function search($keywords, $searchIndex, $locale='com') {
            $timeStamp = gmdate("Y-m-d\TH:i:s\Z");
            $operation = "ItemSearch";
            $responseGroup = "Images,ItemAttributes,Offers";
            $query =  "AWSAccessKeyId=" . $this->_key
                    . "&AssociateTag=" . $this->_associateTag
                    . "&Keywords=" . $keywords
                    . "&Operation=" . $operation
                    . "&ResponseGroup=" . $responseGroup
                    . "&SearchIndex=" . $searchIndex
                    . "&Service=AWSECommerceService"
                    . "&Version=" . $this->_version
                    . "&Timestamp=" . $timeStamp;
            $url = $this->_baseUrl . "?" . $query;
            $url = $this->_signUrl($url);
            $xml = $this->_sendRequest($url);
            $products = array();
            foreach($xml->Items->Item as $product) {
                $products[] = $this->_parseProduct($product);
            }
            return $products;
        }

        function getProduct($asin) {

            $timeStamp = gmdate("Y-m-d\TH:i:s\Z");
            $operation = "ItemLookup";
            $responseGroup = "Images,ItemAttributes,Offers,Reviews";
            $sort = "relevancerank";
            $query =  "AWSAccessKeyId=" . $this->_key
                    . "&AssociateTag=" . $this->_associateTag
                    . "&ItemId=" . urlencode($asin)
                    . "&Operation=" . $operation
                    . "&ResponseGroup=" . $responseGroup
                    . "&Sort=" . $sort
                    . "&Service=AWSECommerceService"
                    . "&Version=" . $this->_version
                    . "&Timestamp=" . $timeStamp;
            $url = $this->_baseUrl . "?" . $query;
            $url = $this->_signUrl($url);

            $xml =  $this->_sendRequest($url);
            $product = $this->_parseProduct($xml->Items->Item);
            return $product;

        }

        function _parseProduct($xml) {
            $product = array();
            $product["title"] = str_replace(array('[', ']'), array('(', ')'), (string)$xml->ItemAttributes->Title);
            $product["price"] = (string)$xml->ItemAttributes->ListPrice->FormattedPrice;
            $product["url"] = (string)$xml->DetailPageURL;
            $product["images"] = array(
                "small" => array(
                    "url" => (string)$xml->SmallImage->URL,
                    "width" => (string)$xml->SmallImage->Width,
                    "height" => (string)$xml->SmallImage->Height
                ),
                "medium" => array(
                    "url" => (string)$xml->MediumImage->URL,
                    "width" => (string)$xml->MediumImage->Width,
                    "height" => (string)$xml->MediumImage->Height
                ),
                "large" => array(
                    "url" => (string)$xml->LargeImage->URL,
                    "width" => (string)$xml->LargeImage->Width,
                    "height" => (string)$xml->LargeImage->Height
                )
            );
            return $product;
        }

        function _signUrl($url) {
            $url = urldecode($url);
            $urlParts = parse_url($url);

            foreach (explode('&', $urlParts['query']) as $part) {
                if (strpos($part, '=')) {
                    list($name, $value) = explode('=', $part);
                } else {
                    $name = $part;
                    $value = '';
                }
                $params[$name] = $value;
            }
            ksort($params);

            $canonical = '';
            foreach ($params as $key=>$val) {
                $canonical .= "{$key}=".rawurlencode($val).'&';
            }

            $canonical = preg_replace("/&$/", '', $canonical);
            $canonical = str_replace(array(' ', '+', ',', ';'), array('%20', '%20', urlencode(','), urlencode(':')), $canonical);
            $string_to_sign = "GET\n{$urlParts['host']}\n{$urlParts['path']}\n$canonical";

            $signature = base64_encode(hash_hmac("sha256", $string_to_sign, $this->_secret, true));
            return "{$urlParts['scheme']}://{$urlParts['host']}{$urlParts['path']}?$canonical&Signature=".rawurlencode($signature);

        }

        function _sendRequest($url) {
            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_TIMEOUT, '3');

            $response = curl_exec($ch);

            curl_close($ch);
            $xml = @simplexml_load_string($response);
            return $xml;
            //return print_r(json_decode(json_encode($xml),true),true);

        }
    }
}