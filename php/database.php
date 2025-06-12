<?php

class Database
{
    private $host = "localhost";
    private $database = "flowers_shop";
    private $username = "root";
    private $password = "";
    private $charset = "utf8mb4";
    private $pdo;

    public function __construct()
    {
        $this->connect();
    }

    private function connect()
    {
        $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }

    public function getConnection()
    {
        return $this->pdo;
    }

    // Method untuk test koneksi
    public function testConnection()
    {
        try {
            $stmt = $this->pdo->query("SELECT 1");
            return true;
        } catch (PDOException $e) {
            return false;
        }
    }
}

// Test koneksi jika file ini diakses langsung
if (basename(__FILE__) == basename($_SERVER["SCRIPT_FILENAME"])) {
    $db = new Database();
    if ($db->testConnection()) {
        echo "✅ Database connection successful!";
    } else {
        echo "❌ Database connection failed!";
    }
}
