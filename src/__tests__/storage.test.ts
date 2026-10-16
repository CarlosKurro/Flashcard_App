import { describe, it, expect } from 'vitest';
import { importBackup } from '../storage/storageService';

describe('Storage Backup & Import Validation', () => {
  it('should reject invalid JSON string', async () => {
    const res = await importBackup('invalid json syntax {{{{');
    expect(res.success).toBe(false);
    expect(res.error).toContain('Lỗi đọc tệp JSON');
  });

  it('should reject JSON that does not match backup schema', async () => {
    const res = await importBackup(JSON.stringify({ someKey: 'wrong format' }));
    expect(res.success).toBe(false);
    expect(res.error).toContain('Định dạng dữ liệu không khớp schema');
  });

  it('should validate empty or null input', async () => {
    const res = await importBackup('');
    expect(res.success).toBe(false);
  });
});
