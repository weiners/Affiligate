<?php
if (!class_exists("AffiligateLib")) {
    Class AffiligateLib {

        function AffiligateLib() {
        }

        function doesInstanceBelongToUser($sql, $instanceId, $userId, $createIfEmpty=false) {
            $rs = array();
            $rs["success"] = false;
            $rs["message"] = "Invalid DB";
            if (!isset($userId) || !isset($instanceId)) {
                $rs["message"] = "No user data";
                return $rs;
            }
            // First see that instance belongs to this user.
            if ($sql) {
                $selected = mysql_select_db("affiligate", $sql);
                if ($selected) {
                    $query = sprintf("SELECT * FROM user_instances WHERE instance_id='%s'", mysql_real_escape_string($instanceId));
                    $result = mysql_query($query);
                    if (!$result) {
                        $rs["message"] = "Unknown DB error when fetching instance: ". mysql_error();
                        return $rs;
                    }
                    $rowCount = mysql_num_rows($result);
                    if ($rowCount>0) { // if instanceID found, check that user ID is the owner
                        $row = mysql_fetch_array($result, true);
                        if ($row["user_id"]!=$userId) {
                            $rs["message"] = "Instance ID doesn't belong to this user!";
                            return $rs;
                        }
                    } else {    // if instanceID not found, create an entry
                        if ($createIfEmpty) {
                            $columns = "user_id,instance_id";
                            $data = $this->createInsertData(array($userId, $instanceId));
                            $query = sprintf("INSERT INTO user_instances (%s) VALUES (%s)", $columns, $data);
                            $result = mysql_query($query);
                            if (!$result) {
                                $rs["message"] = "Unknown DB error when creating user entry: ". mysql_error();
                                return $rs;
                            }
                        } else {
                            $rs["message"] = "Instance ID not found!";
                            return $rs;
                        }
                    }
                    $rs["success"] = true;
                    $rs["message"] = "ok";
                }
            }
            return $rs;
        }

        function createInsertData($data_arr) {
            foreach ($data_arr as &$value) {
                if (is_string($value)) {
                    $value = "'" . mysql_real_escape_string($value) . "'";
                } else {
                    $value = "'" . $value . "'";
                }
            }
            unset($value);
            $data = implode(",", $data_arr);
            return $data;
        }

        function javascript_escape($str) {
            $new_str = '';
            $str_len = strlen($str);
            for($i = 0; $i < $str_len; $i++) {
                $new_str .= '\\x' . dechex(ord(substr($str, $i, 1)));
            }
            return $new_str;
        }
    }
}