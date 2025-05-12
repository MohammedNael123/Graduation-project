// 1. استيراد المكتبات المطلوبة
const express = require('express');
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require('bcrypt'); // لتشفير كلمة السر
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


router.post('/update-profile', async (req, res) => {
  // 3. التحقق من وجود مستخدم مسجل الدخول عبر الجلسة (Session)
  const sessionUser = req.session.user;

  if (!sessionUser || !sessionUser.id) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
  }

  // 4. استخراج البيانات المراد تحديثها من الطلب (Request)
  const userId = sessionUser.id;
  const { full_name, email, password } = req.body;

  // 5. تجميع الحقول المحدثة في كائن (updatedFields)
  const updatedFields = {};
  
  if (full_name) updatedFields.full_name = full_name; 
  if (email) updatedFields.email = email;

  // 6. إذا كانت هناك كلمة سر جديدة، تشفيرها قبل الحفظ
  if (password && password.trim() !== "") {
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // تشفير الباسورد
      updatedFields.password = hashedPassword; 
    } catch (error) {
      return res.status(500).json({ error: 'خطأ في تشفير كلمة السر' });
    }
  }

  // 7. إذا لم يكن هناك بيانات لتحديثها، نرسل رسالة خطأ
  if (Object.keys(updatedFields).length === 0) {
    return res.status(400).json({ error: 'لم يتم إرسال أي بيانات للتحديث' });
  }

  // 8. محاولة تحديث البيانات في Supabase
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updatedFields) 
      .eq('id', userId); 


    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'حدث خطأ أثناء تحديث البيانات: ' + error.message });
    }
    res.json({ message: '✅ تم تحديث البروفايل بنجاح', updatedData: updatedFields });

  } catch (error) {

    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'حدث خطأ غير متوقع' });
  }
});
module.exports = router;