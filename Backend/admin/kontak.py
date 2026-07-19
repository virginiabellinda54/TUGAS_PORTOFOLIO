from flask import Blueprint, request, jsonify
from model import Database
from Backend.admin.login import token_required

kontak_bp = Blueprint('kontak', __name__)


@kontak_bp.route('/messages', methods=['GET'])
@token_required
def get_messages(current_user):
    """Mengambil semua pesan kontak (Admin Only)"""
    try:
        db = Database()
        query = "SELECT * FROM kontak ORDER BY created_at DESC"
        result = db.execute_query(query, fetch=True)

        return jsonify({
            'success': True,
            'data': result if result else []
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@kontak_bp.route('/messages/<int:id>', methods=['GET'])
@token_required
def get_message_by_id(current_user, id):
    """Mengambil satu pesan berdasarkan ID (Admin Only)"""
    try:
        db = Database()
        query = "SELECT * FROM kontak WHERE id = %s"
        result = db.execute_query(query, (id,), fetch=True)

        if not result:
            return jsonify({'error': 'Pesan tidak ditemukan'}), 404

        return jsonify({'success': True, 'data': result[0]}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@kontak_bp.route('/messages', methods=['POST'])
def create_message():
    """Menyimpan pesan dari form kontak"""

    try:
        data = request.get_json()

        required_fields = ['nama', 'email', 'subjek', 'pesan']

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'error': f'{field} wajib diisi'}), 400

        db = Database()

        query = """
            INSERT INTO kontak
            (nama, email, subjek, pesan)
            VALUES (%s, %s, %s, %s)
        """

        values = (
            data['nama'],
            data['email'],
            data['subjek'],
            data['pesan']
        )

        db.execute_query(query, values)

        return jsonify({
            'success': True,
            'message': 'Pesan berhasil dikirim'}), 201

    except Exception as e:
        return jsonify({
            'error': str(e)}), 500
        
@kontak_bp.route('/messages/<int:id>/read', methods=['PATCH'])
@token_required
def mark_message_read(current_user, id):
    """Menandai pesan sebagai sudah dibaca (Admin Only)"""
    try:
        db = Database()
        check_query = "SELECT id FROM kontak WHERE id = %s"
        existing = db.execute_query(check_query, (id,), fetch=True)

        if not existing:
            return jsonify({'error': 'Pesan tidak ditemukan'}), 404

        query = "UPDATE kontak SET is_read = 1 WHERE id = %s"
        db.execute_query(query, (id,))

        return jsonify({'success': True, 'message': 'Pesan ditandai sudah dibaca'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@kontak_bp.route('/messages/<int:id>', methods=['DELETE'])
@token_required
def delete_message(current_user, id):
    """Menghapus pesan kontak (Admin Only)"""
    try:
        db = Database()
        check_query = "SELECT id FROM kontak WHERE id = %s"
        existing = db.execute_query(check_query, (id,), fetch=True)

        if not existing:
            return jsonify({'error': 'Pesan tidak ditemukan'}), 404

        query = "DELETE FROM kontak WHERE id = %s"
        db.execute_query(query, (id,))

        return jsonify({'success': True, 'message': 'Pesan berhasil dihapus'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
