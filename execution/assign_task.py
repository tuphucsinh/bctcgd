import subprocess
import sys

def assign_task(agent_id, task):
    """Giao việc cho Agent thông qua agent-manager-skill"""
    # Đường dẫn đến script main (theo cấu trúc terminal anh đang chạy)
    manager_path = 'agent-manager/scripts/main.py'
    
    print(f"🤖 Đang kết nối với Agent: {agent_id}...")
    
    try:
        # Chạy lệnh assign và truyền nội dung task vào stdin
        process = subprocess.Popen(
            ['python3', manager_path, 'assign', agent_id],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8' 
        )
        
        stdout, stderr = process.communicate(input=task)
        
        if process.returncode == 0:
            print(f"✅ Thành công! {agent_id} đã nhận lệnh.")
            print("-" * 30)
            print(stdout.strip())
        else:
            print(f"❌ Có lỗi xảy ra: {stderr.strip()}")
            
    except FileNotFoundError:
        print(f"🧨 Không tìm thấy file {manager_path}. Anh hãy kiểm tra lại vị trí folder agent-manager.")
    except Exception as e:
        print(f"🧨 Lỗi hệ thống: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("💡 Cách dùng: python execution/assign_task.py [ID_AGENT] \"[NỘI DUNG CÔNG VIỆC]\"")
        print("Ví dụ: python execution/assign_task.py EMP_0001 \"Hãy tổng hợp báo cáo tháng 3\"")
    else:
        assign_task(sys.argv[1], sys.argv[2])
