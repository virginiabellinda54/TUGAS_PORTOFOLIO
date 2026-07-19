import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # TiDB Cloud Database Configuration
    DB_HOST = os.getenv('DB_HOST', 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com')
    DB_PORT = int(os.getenv('DB_PORT', 4000))
    DB_USER = os.getenv('DB_USER', '32oF6p9ZToF9GAx.root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'RcXNK0O3ihfS63Tw')
    DB_NAME = os.getenv('DB_NAME', 'Portofolio')
    
    MYSQL_CONFIG = {
        'host': DB_HOST,
        'port': DB_PORT,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'database': DB_NAME,
        'ssl_ca': os.getenv('DB_CA_PATH', None)
    }
    
    # Flask Configuration
    SECRET_KEY = os.getenv("SECRET_KEY")
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # Cloudinary Configuration (Dipecah agar lebih clean)
    # Jika CLOUDINARY_URL ada, kita bisa parse, tapi manual lebih aman untuk typing
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'gmavghlm')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '798169548291216')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'CSKFIKOW8WNHlxlXBq4YSIlerUk')
    
    # Resend API Configuration
    RESEND_API_KEY = os.getenv('RESEND_API_KEY', 're_UtLXpbxJ_VyxQcm7wDZ2MJDXSunZDV9nk')