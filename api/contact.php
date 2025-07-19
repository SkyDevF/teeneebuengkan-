<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'POST':
        // บันทึกข้อความใหม่
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['name']) || !isset($input['email']) || !isset($input['message'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ข้อมูลไม่ครบถ้วน']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
            $stmt->execute([$input['name'], $input['email'], $input['message']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'บันทึกข้อความเรียบร้อยแล้ว',
                'id' => $pdo->lastInsertId()
            ]);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'เกิดข้อผิดพลาดในการบันทึกข้อมูล']);
        }
        break;
        
    case 'GET':
        // ดึงข้อความทั้งหมด (สำหรับ admin)
        try {
            $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
            $messages = $stmt->fetchAll();
            
            echo json_encode($messages);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'เกิดข้อผิดพลาดในการดึงข้อมูล']);
        }
        break;
        
    case 'PUT':
        // อัปเดตสถานะข้อความ
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['status'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ข้อมูลไม่ครบถ้วน']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("UPDATE contact_messages SET status = ? WHERE id = ?");
            $stmt->execute([$input['status'], $input['id']]);
            
            echo json_encode(['success' => true, 'message' => 'อัปเดตสถานะเรียบร้อยแล้ว']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล']);
        }
        break;
        
    case 'DELETE':
        // ลบข้อความ
        $id = $_GET['id'] ?? null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ไม่พบ ID ที่ต้องการลบ']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE id = ?");
            $stmt->execute([$id]);
            
            echo json_encode(['success' => true, 'message' => 'ลบข้อความเรียบร้อยแล้ว']);
        } catch(PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'เกิดข้อผิดพลาดในการลบข้อมูล']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>