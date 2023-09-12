const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const path = require('path');

// التحقق من وجود ملف JSON
let data = { cities: [] }; // بيانات افتراضية
const dataFilePath = 'public/data.json';

if (fs.existsSync(dataFilePath)) {
    // إذا وجد الملف JSON، قم بقراءة البيانات منه
    const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
    data = JSON.parse(jsonData);
} else {
    // إذا لم يجد الملف JSON، قم بإنشاء ملف JSON جديد
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// تكوين الجلسة
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // يجب تعديله إلى "true" عند استخدام HTTPS
        maxAge: 3600000
    }
}));

// تحديد محتوى المجلد العام
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

// صفحة تسجيل الدخول
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/display.html');
});

// محاولة تسجيل الدخول
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // قم بتنفيذ التحقق من اسم المستخدم وكلمة المرور هنا
    // هذا مثال بسيط
    if (username === 'admin1' && password === '0625') {
        req.session.loggedin = true;
        res.redirect('/admin');
    } else {
        res.send('فشل تسجيل الدخول. يرجى التحقق من اسم المستخدم وكلمة المرور.');
    }
});

// صفحة الإدارة
app.get('/admin', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(__dirname + '/public/admin.html');
    } else {
        res.redirect('/');
    }
});

// استخدام body-parser للتعامل مع JSON
app.use(bodyParser.json());

// تحديث ملف JSON بناءً على البيانات المرسلة من الإدارة
app.get('/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data.json');
        }

        res.json(JSON.parse(data));
    });
});
app.post('/update-data', (req, res) => {
    const newData = req.body;

    fs.readFile(dataFilePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('حدث خطأ أثناء قراءة الملف JSON:', err);
            return res.status(500).json({ error: 'حدث خطأ أثناء قراءة الملف JSON' });
        }

        const jsonData = JSON.parse(data);
        jsonData.cities.push(newData); // إضافة معلومات المدينة إلى المصفوفة

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('حدث خطأ أثناء كتابة الملف JSON:', err);
                return res.status(500).json({ error: 'حدث خطأ أثناء كتابة الملف JSON' });
            }

            res.json({ success: true });
        });
    });
});
// مسار لتحديث البيانات في الملف JSON
app.post('/update', (req, res) => {
    const updatedCity = req.body;
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading data.json');
        }

        const jsonData = JSON.parse(data);

        // البحث عن المدينة بالاسم وتحديثها
        const updatedCities = jsonData.cities.map(city => {
            if (city.name === updatedCity.name) {
                return updatedCity;
            }
            return city;
        });

        jsonData.cities = updatedCities;

        // كتابة البيانات المحدثة إلى الملف JSON
        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing data.json');
            }
            res.json({ message: 'Data updated successfully!' });
        });
    });
});
// ...

// تحديث ملف JSON بناءً على البيانات المرسلة من الإدارة

// ...

// تسجيل الخروج
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// قم بتشغيل الخادم
const port = 3000;
app.listen(port, () => {
    console.log(`الخادم يعمل على المنفذ ${port}`);
});
