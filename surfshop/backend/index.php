<?php

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 3600");
    exit(0);
}


$parts = explode("/", $_SERVER["REQUEST_URI"]);

match ($parts[2]) {
    'in' => in(),
    default => nop()
};

function in() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 3600");

    header('Content-Type: application/json');
    $rawInput = file_get_contents('php://input');

    $requestData = json_decode($rawInput, true);

    if ($requestData !== null) {
        if (!isset($requestData['password']) || !isset($requestData['email'])) {
            http_response_code(400);
            echo json_encode(array('error' => 'Invalid JSON data'));
            return;
        }

        $response = array();
        if (isset($requestData['username'])) {
            $response = createUser($requestData);
        } else {
            $response = logInUser($requestData);
        }

        if (isset($response['error'])) {
            if ($response['error'] === 'unauthorized') {
                http_response_code(401);
            } else {
                http_response_code(500);
            }
        } else {
            http_response_code(200);
        }

        echo json_encode($response);
    } else {
        http_response_code(400);
        echo json_encode(array('error' => 'Invalid JSON data'));
    }
}

function createUser($requestData) {
    $username = $requestData['username'];
    $password = $requestData['password'];
    $email = $requestData['email'];

    $dbHost = 'localhost';
    $dbUser = 'root';
    $dbPass = '';
    $dbName = 'mahalo';

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    if ($conn->connect_error) {
        return array('error' => 'failed to connect to MySQL');
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    $sql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $username, $hashedPassword, $email);

    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
        return array('message' => 'User created successfully');
    } else {
        $stmt->close();
        $conn->close();
        return array('error' => 'User creation failed');
    }
}

function logInUser($requestData) {
    $password = $requestData['password'];
    $email = $requestData['email'];

    $dbHost = 'localhost';
    $dbUser = 'root';
    $dbPass = '';
    $dbName = 'mahalo';

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    if ($conn->connect_error) {
        return array('error' => 'failed to connect to MySQL');
    }

    $sql = "SELECT password FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->bind_result($hashedPassword);
    $stmt->fetch();
    $stmt->close();
    $conn->close();

    if (password_verify($password, $hashedPassword)) {
        return array('message' => 'User logged in successfully');
    } else {
        return array('error' => 'unauthorized');
    }
}

function nop() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Max-Age: 3600");
}