// Firebase Configuration (from your project)
const firebaseConfig = {
    apiKey: "AIzaSyAHcBLpG_b-zdkT7wacZfD4Dfde62m8IXU",
    authDomain: "ketnoifirebase-3a966.firebaseapp.com",
    projectId: "ketnoifirebase-3a966",
    storageBucket: "ketnoifirebase-3a966.firebasestorage.app",
    messagingSenderId: "851559898761",
    appId: "1:851559898761:web:0d0d79b1e0ce8f0d3e2fe0"
};

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const productForm = document.getElementById('productForm');
const productLog = document.getElementById('productLog');
const categoryLog = document.getElementById('categoryLog');
const manageLog = document.getElementById('manageLog');
const firebaseStatus = document.getElementById('firebaseStatus');
const authSection = document.getElementById('authSection');
const adminContent = document.getElementById('adminContent');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const btnAdminLogin = document.getElementById('btnAdminLogin');
const btnAdminLogout = document.getElementById('btnAdminLogout');
const authMessage = document.getElementById('authMessage');
const auth = getAuth(app);

btnAdminLogin?.addEventListener('click', async () => {
    const email = adminEmailInput.value.trim();
    const password = adminPasswordInput.value.trim();
    if (!email || !password) {
        authMessage.textContent = 'Vui lòng nhập email và mật khẩu.';
        return;
    }

    authMessage.textContent = 'Đang đăng nhập...';
    try {
        await signInWithEmailAndPassword(auth, email, password);
        authMessage.textContent = '';
    } catch (error) {
        authMessage.textContent = `Đăng nhập thất bại: ${error.message}`;
    }
});

btnAdminLogout?.addEventListener('click', async () => {
    await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        authSection.style.display = 'none';
        adminContent.style.display = 'block';
        btnAdminLogout.style.display = 'inline-flex';
        firebaseStatus.textContent = '✅ Admin đã đăng nhập';
        firebaseStatus.classList.add('connected');
        updateProductCount();
        updateCategoryCount();
        populateCategoryDropdowns();
        checkFirebaseConnection();
    } else {
        authSection.style.display = 'block';
        adminContent.style.display = 'none';
        btnAdminLogout.style.display = 'none';
        firebaseStatus.textContent = '⚠️ Chưa đăng nhập admin';
        firebaseStatus.classList.remove('connected');
    }
});

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        switchTab(tabName, e.target);
    });
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        switchMode(mode, e.target);
    });
});

document.querySelectorAll('.manage-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.manageTab;
        switchManageTab(tab, e.target);
    });
});

function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    btn.classList.add('active');
}

function switchMode(mode, btn) {
    document.querySelectorAll('.mode-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.mode-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(mode === 'single' ? 'singleCategoryMode' : 'batchCategoryMode').classList.add('active');
    btn.classList.add('active');
}

function switchManageTab(tab, btn) {
    document.querySelectorAll('.manage-tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.manage-tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab + '-manage').classList.add('active');
    btn.classList.add('active');
}

function addLog(message, type, container) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    container.insertBefore(entry, container.firstChild);
    while (container.children.length > 50) {
        container.removeChild(container.lastChild);
    }
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('productImage').files[0];
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const categoryId = document.getElementById('productCategory').value;
    const tags = document.getElementById('productTags').value;
    const sizes = Array.from(document.querySelectorAll('.size-checkbox:checked')).map(cb => cb.value);
    const colors = Array.from(document.querySelectorAll('.color-checkbox:checked')).map(cb => cb.value);

    if (!file) {
        addLog('❌ Vui lòng chọn ảnh', 'error', productLog);
        return;
    }

    addLog(`📤 Đang upload "${name}"...`, 'info', productLog);

    try {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const filepath = `products/${categoryId}/${filename}`;
        const storageRef = ref(storage, filepath);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        let quantityVal = 0;
        let variants = [];
        const variantsWrapper = document.getElementById('productVariantsWrapper');
        if (variantsWrapper && variantsWrapper.style.display === 'block') {
            const inputs = document.getElementById('productVariantsContainer').querySelectorAll('.variant-qty-input');
            inputs.forEach(input => {
                variants.push({
                    size: input.dataset.size || '',
                    color: input.dataset.color || '',
                    quantity: parseInt(input.value) || 0
                });
            });
            quantityVal = variants.reduce((sum, v) => sum + v.quantity, 0);
        } else {
            quantityVal = parseInt(document.getElementById('productQuantity')?.value) || 0;
        }

        const productData = {
            name,
            price: parseInt(price),
            categoryId,
            imageUrl: downloadUrl,
            storagePath: filepath,
            uploadedAt: new Date(),
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            sizes: sizes,
            colors: colors,
            quantity: quantityVal,
            variants: variants
        };
        const docRef = await addDoc(collection(db, 'products'), productData);
        addLog(`✅ "${name}" upload thành công!`, 'success', productLog);
        addLog(`📍 Firestore ID: ${docRef.id}`, 'info', productLog);
        productForm.reset();
        document.getElementById('productVariantsWrapper').style.display = 'none';
        document.getElementById('productVariantsContainer').innerHTML = '';
        document.getElementById('productQuantityGroup').style.display = 'block';
        updateProductCount();
    } catch (error) {
        addLog(`❌ Lỗi: ${error.message}`, 'error', productLog);
    }
});

const singleCategoryForm = document.getElementById('singleCategoryForm');
singleCategoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('categoryImage').files[0];
    const name = document.getElementById('categoryName').value;
    const id = document.getElementById('categoryId').value;

    if (!file) {
        addLog('❌ Vui lòng chọn ảnh', 'error', categoryLog);
        return;
    }

    addLog(`📤 Đang upload danh mục "${name}"...`, 'info', categoryLog);

    try {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.name}`;
        const filepath = `categories/${id}/${filename}`;
        const storageRef = ref(storage, filepath);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        const categoryRef = doc(db, 'categories', id);
        await setDoc(categoryRef, {
            name,
            imageUrl: downloadUrl,
            storagePath: filepath,
            uploadedAt: new Date(),
        }, { merge: true });
        addLog(`✅ Danh mục "${name}" upload thành công!`, 'success', categoryLog);
        singleCategoryForm.reset();
        updateCategoryCount();
        populateCategoryDropdowns();
    } catch (error) {
        addLog(`❌ Lỗi: ${error.message}`, 'error', categoryLog);
    }
});

document.getElementById('loadProducts').addEventListener('click', async () => {
    addLog('📥 Đang tải sản phẩm...', 'info', manageLog);
    try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';
        if (querySnapshot.empty) {
            productsList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Không có sản phẩm</p>';
            addLog('ℹ️ Chưa có sản phẩm', 'info', manageLog);
            return;
        }
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
                <div class="item-card-body">
                    <div class="item-card-title">${data.name}</div>
                    <div class="item-card-meta">
                        <div>💵 ${Number(data.price).toLocaleString()} VND</div>
                        <div>📁 ${data.categoryId}</div>
                        <div style="margin-top: 5px;">🔗 ${data.storagePath || 'N/A'}</div>
                    </div>
                    
                    <div class="item-card-variants-editor" style="margin-top: 8px; border-top: 1px dashed #eee; padding-top: 5px;">
                        <!-- Sizes Checkboxes on Card -->
                        <div style="margin-bottom: 5px;">
                            <span style="font-size: 11px; font-weight: bold; color: #495057; display: block; margin-bottom: 2px;">Kích cỡ:</span>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; background: #fff; padding: 4px; border: 1px solid #ced4da; border-radius: 4px;">
                                ${['S', 'M', 'L', 'XL', 'XXL'].map(s => {
                                    const checked = (data.sizes || []).includes(s) ? 'checked' : '';
                                    return `<label style="cursor: pointer; display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: normal; margin: 0;"><input type="checkbox" class="card-size-checkbox" value="${s}" ${checked}> ${s}</label>`;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Colors Checkboxes on Card -->
                        <div style="margin-bottom: 5px;">
                            <span style="font-size: 11px; font-weight: bold; color: #495057; display: block; margin-bottom: 2px;">Màu sắc:</span>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; background: #fff; padding: 4px; border: 1px solid #ced4da; border-radius: 4px;">
                                ${['Xanh', 'Đỏ', 'Tím', 'Vàng', 'Trắng', 'Đen'].map(c => {
                                    const checked = (data.colors || []).includes(c) ? 'checked' : '';
                                    return `<label style="cursor: pointer; display: flex; align-items: center; gap: 2px; font-size: 11px; font-weight: normal; margin: 0;"><input type="checkbox" class="card-color-checkbox" value="${c}" ${checked}> ${c}</label>`;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Dynamic Variant Inputs on Card -->
                        <div class="card-variants-container" style="margin-top: 5px; display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 6px; max-height: 120px; overflow-y: auto; background: #f8f9fa; padding: 5px; border-radius: 4px; border: 1px solid #e9ecef;">
                            <!-- Generated dynamically via JS -->
                        </div>

                        <!-- Save Config Button -->
                        <div style="margin-top: 5px; display: flex; justify-content: flex-end;">
                            <button class="btn-card-save-config" style="width: 100%; padding: 5px; font-size: 11px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Lưu phân loại & SL</button>
                        </div>
                    </div>

                    <div class="item-card-actions" style="margin-top: 8px;">
                        <button class="btn-edit">Sửa</button>
                        <button class="btn-delete">Xóa</button>
                    </div>
                </div>
            `;
            const editButton = card.querySelector('.btn-edit');
            const deleteButton = card.querySelector('.btn-delete');
            const cardSaveConfigBtn = card.querySelector('.btn-card-save-config');

            editButton.addEventListener('click', () => openEditProduct(docSnap.id, data));
            deleteButton.addEventListener('click', () => deleteProduct(docSnap.id));

            const updateCardVariants = () => {
                const sizes = Array.from(card.querySelectorAll('.card-size-checkbox:checked')).map(cb => cb.value);
                const colors = Array.from(card.querySelectorAll('.card-color-checkbox:checked')).map(cb => cb.value);
                const container = card.querySelector('.card-variants-container');
                if (!container) return;

                if (sizes.length === 0 && colors.length === 0) {
                    container.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; width: 100%; grid-column: 1 / -1;">
                            <span style="font-size: 11px; font-weight: bold; color: #495057;">Số lượng tổng:</span>
                            <input type="number" class="card-global-qty" value="${data.quantity !== undefined ? data.quantity : 10}" min="0" style="width: 45px; padding: 2px; border: 1px solid #ced4da; border-radius: 3px; font-size: 11px; text-align: center;">
                        </div>
                    `;
                    return;
                }

                let combinations = [];
                if (sizes.length > 0 && colors.length > 0) {
                    sizes.forEach(size => {
                        colors.forEach(color => {
                            combinations.push({ size, color });
                        });
                    });
                } else if (sizes.length > 0) {
                    sizes.forEach(size => {
                        combinations.push({ size, color: '' });
                    });
                } else if (colors.length > 0) {
                    colors.forEach(color => {
                        combinations.push({ size: '', color });
                    });
                }

                container.innerHTML = '';
                combinations.forEach(combo => {
                    const label = (combo.size && combo.color) ? `${combo.size}-${combo.color}` : (combo.size || combo.color);
                    let val = 10;
                    if (Array.isArray(data.variants)) {
                        const match = data.variants.find(v => v.size === combo.size && v.color === combo.color);
                        if (match) {
                            val = match.quantity;
                        }
                    }
                    const div = document.createElement('div');
                    div.style = 'display: flex; flex-direction: column; gap: 1px; border: 1px solid #dee2e6; padding: 3px; border-radius: 3px; background: #fff; align-items: center;';
                    div.innerHTML = `
                        <span style="font-size: 10px; font-weight: bold; color: #6c757d; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${label}</span>
                        <input type="number" class="card-var-qty" data-size="${combo.size}" data-color="${combo.color}" value="${val}" min="0" style="width: 100%; max-width: 45px; padding: 2px; border: 1px solid #ced4da; border-radius: 3px; font-size: 11px; text-align: center;">
                    `;
                    container.appendChild(div);
                });
            };

            // Initialize dynamic variant inputs
            updateCardVariants();

            // Bind change events for checkboxes on the card
            card.querySelectorAll('.card-size-checkbox, .card-color-checkbox').forEach(cb => {
                cb.addEventListener('change', updateCardVariants);
            });

            // Bind save action
            if (cardSaveConfigBtn) {
                cardSaveConfigBtn.addEventListener('click', async () => {
                    const sizes = Array.from(card.querySelectorAll('.card-size-checkbox:checked')).map(cb => cb.value);
                    const colors = Array.from(card.querySelectorAll('.card-color-checkbox:checked')).map(cb => cb.value);
                    
                    let quantityVal = 0;
                    let variants = [];
                    const varInputs = card.querySelectorAll('.card-var-qty');
                    if (varInputs.length > 0) {
                        varInputs.forEach(input => {
                            variants.push({
                                size: input.dataset.size || '',
                                color: input.dataset.color || '',
                                quantity: parseInt(input.value) || 0
                            });
                        });
                        quantityVal = variants.reduce((sum, v) => sum + v.quantity, 0);
                    } else {
                        const globalInput = card.querySelector('.card-global-qty');
                        quantityVal = parseInt(globalInput ? globalInput.value : 0) || 0;
                    }

                    cardSaveConfigBtn.disabled = true;
                    cardSaveConfigBtn.textContent = '...';
                    try {
                        await updateDoc(doc(db, 'products', docSnap.id), {
                            sizes: sizes,
                            colors: colors,
                            variants: variants,
                            quantity: quantityVal
                        });
                        addLog(`✅ Đã cập nhật phân loại & SL cho "${data.name}"`, 'success', manageLog);
                        document.getElementById('loadProducts').click();
                    } catch (error) {
                        addLog(`❌ Lỗi cập nhật phân loại: ${error.message}`, 'error', manageLog);
                        cardSaveConfigBtn.disabled = false;
                        cardSaveConfigBtn.textContent = 'Lưu phân loại & SL';
                    }
                });
            }

            productsList.appendChild(card);
        });
        addLog(`✅ Đã tải ${querySnapshot.size} sản phẩm`, 'success', manageLog);
    } catch (error) {
        addLog(`❌ Lỗi tải sản phẩm: ${error.message}`, 'error', manageLog);
    }
});

document.getElementById('loadCategories').addEventListener('click', async () => {
    addLog('📥 Đang tải danh mục...', 'info', manageLog);
    try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesList = document.getElementById('categoriesList');
        categoriesList.innerHTML = '';
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <img src="${data.imageUrl}" alt="${data.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
                <div class="item-card-body">
                    <div class="item-card-title">${data.name}</div>
                    <div class="item-card-meta">
                        <div>🔑 ${docSnap.id}</div>
                        <div style="margin-top: 5px;">🔗 ${data.storagePath || 'N/A'}</div>
                    </div>
                    <div class="item-card-actions">
                        <button class="btn-copy">Sao chép URL</button>
                        <button class="btn-edit">Sửa</button>
                        <button class="btn-delete">Xóa</button>
                    </div>
                </div>
            `;
            const copyButton = card.querySelector('.btn-copy');
            const editButton = card.querySelector('.btn-edit');
            const deleteButton = card.querySelector('.btn-delete');
            copyButton.addEventListener('click', () => copyToClipboard(data.imageUrl));
            editButton.addEventListener('click', () => openEditCategory(docSnap.id, data));
            deleteButton.addEventListener('click', () => deleteCategory(docSnap.id));
            categoriesList.appendChild(card);
        });
        addLog(`✅ Đã tải ${querySnapshot.size} danh mục`, 'success', manageLog);
    } catch (error) {
        addLog(`❌ Lỗi tải danh mục: ${error.message}`, 'error', manageLog);
    }
});

const batchCategoryForm = document.getElementById('batchCategoryForm');
const productSearchInput = document.getElementById('productSearch');
const loadStorageButton = document.getElementById('loadStorage');
const storageFolderSelect = document.getElementById('storageFolder');
const loadOrdersButton = document.getElementById('loadOrders');
const orderStatusFilter = document.getElementById('orderStatusFilter');

batchCategoryForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('batchCategoryFile').files[0];
    if (!file) {
        addLog('❌ Vui lòng chọn file CSV', 'error', categoryLog);
        return;
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    addLog(`📥 Đang xử lý ${lines.length} dòng CSV...`, 'info', categoryLog);
    for (const line of lines) {
        const parts = line.split(',').map(part => part.trim());
        if (parts.length < 2) {
            addLog(`⚠️ Bỏ qua dòng không hợp lệ: ${line}`, 'error', categoryLog);
            continue;
        }
        const name = parts[0];
        const imageUrl = parts.length === 2 ? parts[1] : parts[2];
        const id = parts.length === 3 ? parts[1] : slugify(name);
        if (!imageUrl) {
            addLog(`⚠️ Không tìm thấy URL ảnh cho ${name}`, 'error', categoryLog);
            continue;
        }
        if (!/^https?:\/\//i.test(imageUrl)) {
            addLog(`⚠️ Chỉ hỗ trợ ảnh trực tuyến (URL) cho ${name}`, 'error', categoryLog);
            continue;
        }
        await uploadCategoryFromUrl(id, name, imageUrl);
    }
    addLog('✅ Batch upload danh mục hoàn tất', 'success', categoryLog);
    updateCategoryCount();
    populateCategoryDropdowns();
});

productSearchInput?.addEventListener('input', () => filterProductList());
loadStorageButton?.addEventListener('click', () => loadStorageFiles());
storageFolderSelect?.addEventListener('change', () => loadStorageFiles());
loadOrdersButton?.addEventListener('click', () => loadOrders());
orderStatusFilter?.addEventListener('change', () => loadOrders());

function filterProductList() {
    const query = productSearchInput?.value.toLowerCase() || '';
    document.querySelectorAll('#productsList .item-card').forEach(card => {
        const title = card.querySelector('.item-card-title')?.textContent.toLowerCase() || '';
        card.style.display = title.includes(query) ? 'block' : 'none';
    });
}

async function loadStorageFiles() {
    addLog('📥 Đang tải file lưu trữ...', 'info', manageLog);
    const folder = storageFolderSelect?.value || '';
    const listRef = ref(storage, folder);
    const storageList = document.getElementById('storageList');
    storageList.innerHTML = '';
    try {
        const res = await listAll(listRef);
        if (res.items.length === 0) {
            storageList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Không có file nào trong thư mục này</p>';
            addLog('ℹ️ Không có file lưu trữ', 'info', manageLog);
            return;
        }
        for (const itemRef of res.items) {
            const url = await getDownloadURL(itemRef);
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-card-body">
                    <div class="item-card-title">${itemRef.fullPath}</div>
                    <div class="item-card-meta">
                        <div>🔗 <a href="${url}" target="_blank">Mở file</a></div>
                    </div>
                </div>
            `;
            storageList.appendChild(card);
        }
        addLog(`✅ Đã tải ${res.items.length} file lưu trữ`, 'success', manageLog);
    } catch (error) {
        addLog(`❌ Lỗi tải file lưu trữ: ${error.message}`, 'error', manageLog);
    }
}

async function loadOrders() {
    addLog('📥 Đang tải đơn hàng...', 'info', manageLog);
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        let orders = [];
        querySnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        const statusFilter = orderStatusFilter?.value;
        if (statusFilter) {
            orders = orders.filter(order => order.status === statusFilter);
        }
        if (!orders.length) {
            ordersList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Không có đơn hàng</p>';
            addLog('ℹ️ Chưa có đơn hàng', 'info', manageLog);
            return;
        }
        orders.sort((a, b) => {
            const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
            const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
            return bTime - aTime;
        });
        orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-card-body">
                    <div class="item-card-title">Đơn ${order.orderId || order.id}</div>
                    <div class="item-card-meta">
                        <div>👤 User: ${order.userId || 'N/A'}</div>
                        <div>💰 Tổng: ${formatCurrency(order.total || 0)}</div>
                        <div>📅 ${formatTimestamp(order.createdAt)}</div>
                        <div>📌 Trạng thái: <strong>${order.status || 'Unknown'}</strong></div>
                        <div>🛒 Số sản phẩm: ${order.items?.length || 0}</div>
                    </div>
                    <div class="item-card-actions order-actions"></div>
                    <div class="item-card-details"></div>
                </div>
            `;
            const actions = card.querySelector('.order-actions');
            ['Đang xử lý', 'Đã giao', 'Đã hủy'].forEach(status => {
                const button = document.createElement('button');
                button.className = 'btn btn-secondary';
                button.textContent = status;
                button.addEventListener('click', () => updateOrderStatus(order.id, status));
                actions.appendChild(button);
            });
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.textContent = 'Xóa đơn hàng';
            deleteButton.addEventListener('click', () => deleteOrder(order.id));
            actions.appendChild(deleteButton);
            const details = card.querySelector('.item-card-details');
            if (order.items?.length) {
                details.innerHTML = `<strong>Chi tiết sản phẩm:</strong><ul>${order.items.map(item => {
                    const variantInfo = [item.size, item.color].filter(Boolean).join(' - ');
                    const variantSuffix = variantInfo ? ` (${variantInfo})` : '';
                    return `<li>${item.name || item.title || 'Sản phẩm'}${variantSuffix} x${item.quantity || 1} - ${formatCurrency(item.price || 0)}</li>`;
                }).join('')}</ul>`;
            }
            ordersList.appendChild(card);
        });
        addLog(`✅ Đã tải ${orders.length} đơn hàng`, 'success', manageLog);
    } catch (error) {
        addLog(`❌ Lỗi tải đơn hàng: ${error.message}`, 'error', manageLog);
    }
}

async function updateOrderStatus(id, status) {
    if (!confirm(`Cập nhật trạng thái đơn hàng ${id} thành '${status}'?`)) return;
    try {
        await updateDoc(doc(db, 'orders', id), { status });
        addLog(`✅ Đã cập nhật trạng thái đơn ${id} thành ${status}`, 'success', manageLog);
        loadOrders();
    } catch (error) {
        addLog(`❌ Lỗi cập nhật đơn hàng: ${error.message}`, 'error', manageLog);
    }
}

async function deleteOrder(id) {
    if (!confirm('Bạn chắc chắn muốn xóa đơn hàng này?')) return;
    try {
        await deleteDoc(doc(db, 'orders', id));
        addLog('✅ Đơn hàng đã xóa thành công!', 'success', manageLog);
        loadOrders();
    } catch (error) {
        addLog(`❌ Lỗi xóa đơn hàng: ${error.message}`, 'error', manageLog);
    }
}

function formatCurrency(value) {
    return value == null ? '0đ' : `${Number(value).toLocaleString('vi-VN')}đ`;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function slugify(text) {
    return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function uploadCategoryFromUrl(id, name, imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const filename = `${Date.now()}_${id}.${blob.type.split('/').pop()}`;
        const filepath = `categories/${id}/${filename}`;
        const storageRef = ref(storage, filepath);
        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        const categoryRef = doc(db, 'categories', id);
        await setDoc(categoryRef, {
            name,
            imageUrl: downloadUrl,
            storagePath: filepath,
            uploadedAt: new Date(),
        }, { merge: true });
        addLog(`✅ Đã upload danh mục ${name} thành công`, 'success', categoryLog);
    } catch (error) {
        addLog(`❌ Lỗi upload danh mục ${name}: ${error.message}`, 'error', categoryLog);
    }
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('✅ URL đã sao chép!');
    } catch (err) {
        console.error('Lỗi sao chép:', err);
    }
}

async function deleteProduct(id) {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    try {
        await deleteDoc(doc(db, 'products', id));
        addLog('✅ Sản phẩm đã xóa thành công!', 'success', manageLog);
        document.getElementById('loadProducts').click();
    } catch (error) {
        addLog(`❌ Lỗi: ${error.message}`, 'error', manageLog);
    }
}

async function deleteCategory(id) {
    if (!confirm('Bạn chắc chắn muốn xóa danh mục này?')) return;
    try {
        await deleteDoc(doc(db, 'categories', id));
        addLog('✅ Danh mục đã xóa thành công!', 'success', manageLog);
        document.getElementById('loadCategories').click();
        updateCategoryCount();
        populateCategoryDropdowns();
    } catch (error) {
        addLog(`❌ Lỗi: ${error.message}`, 'error', manageLog);
    }
}

async function updateProductCount() {
    try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        document.getElementById('productCount').textContent = querySnapshot.size;
    } catch (error) {
        console.error('Lỗi cập nhật số sản phẩm:', error);
    }
}

async function updateCategoryCount() {
    try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        document.getElementById('categoryCount').textContent = querySnapshot.size;
    } catch (error) {
        console.error('Lỗi cập nhật số danh mục:', error);
    }
}

async function populateCategoryDropdowns() {
    try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const productCategorySelect = document.getElementById('productCategory');
        const editProductCategorySelect = document.getElementById('editProductCategory');

        if (!productCategorySelect || !editProductCategorySelect) return;

        let optionsHtml = '<option value="">Chọn Danh Mục...</option>';
        let editOptionsHtml = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const name = data.name || id;
            optionsHtml += `<option value="${id}">${name}</option>`;
            editOptionsHtml += `<option value="${id}">${name}</option>`;
        });

        productCategorySelect.innerHTML = optionsHtml;
        editProductCategorySelect.innerHTML = editOptionsHtml;
    } catch (error) {
        console.error('Lỗi tải danh mục vào dropdown:', error);
    }
}

async function checkFirebaseConnection() {
    try {
        await getDocs(collection(db, 'categories'));
        firebaseStatus.textContent = '✅ Kết nối';
        firebaseStatus.classList.add('connected');
        addLog('✅ Kết nối Firebase thành công!', 'success', categoryLog);
    } catch (error) {
        firebaseStatus.textContent = '❌ Lỗi Kết nối';
        firebaseStatus.classList.add('error');
        addLog(`❌ Lỗi Firebase: ${error.message}`, 'error', categoryLog);
    }
}

// Edit Modal Logic
const editProductModal = document.getElementById('editProductModal');
const editCategoryModal = document.getElementById('editCategoryModal');

function openEditProduct(id, data) {
    document.getElementById('editProductId').value = id;
    document.getElementById('editProductName').value = data.name || '';
    document.getElementById('editProductPrice').value = data.price || 0;
    document.getElementById('editProductCategory').value = data.categoryId || '';
    document.getElementById('editProductImageUrl').value = data.imageUrl || '';
    document.getElementById('editProductQuantity').value = data.quantity !== undefined ? data.quantity : 10;
    
    const sizes = data.sizes || [];
    document.querySelectorAll('.edit-size-checkbox').forEach(cb => {
        cb.checked = sizes.includes(cb.value);
    });
    const colors = data.colors || [];
    document.querySelectorAll('.edit-color-checkbox').forEach(cb => {
        cb.checked = colors.includes(cb.value);
    });

    generateVariantsUI('.edit-size-checkbox:checked', '.edit-color-checkbox:checked', 'editProductVariantsContainer', 'editProductVariantsWrapper', 'editProductQuantityGroup', data.variants);

    const fileInput = document.getElementById('editProductImage');
    if (fileInput) fileInput.value = ''; // Reset file input
    editProductModal.style.display = 'block';
}

function openEditCategory(id, data) {
    document.getElementById('editCategoryId').value = id;
    document.getElementById('editCategoryName').value = data.name || '';
    document.getElementById('editCategoryImageUrl').value = data.imageUrl || '';
    const fileInput = document.getElementById('editCategoryImage');
    if (fileInput) fileInput.value = ''; // Reset file input
    editCategoryModal.style.display = 'block';
}

document.getElementById('closeProductModal')?.addEventListener('click', () => {
    editProductModal.style.display = 'none';
});

document.getElementById('closeCategoryModal')?.addEventListener('click', () => {
    editCategoryModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === editProductModal) editProductModal.style.display = 'none';
    if (e.target === editCategoryModal) editCategoryModal.style.display = 'none';
});

document.getElementById('editProductForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('editProductName').value.trim();
    const price = Number(document.getElementById('editProductPrice').value);
    const categoryId = document.getElementById('editProductCategory').value;
    let imageUrl = document.getElementById('editProductImageUrl').value.trim();
    const file = document.getElementById('editProductImage')?.files[0];
    const sizes = Array.from(document.querySelectorAll('.edit-size-checkbox:checked')).map(cb => cb.value);
    const colors = Array.from(document.querySelectorAll('.edit-color-checkbox:checked')).map(cb => cb.value);

    addLog('💾 Đang lưu thay đổi sản phẩm...', 'info', manageLog);
    try {
        let quantityVal = 0;
        let variants = [];
        const editVariantsWrapper = document.getElementById('editProductVariantsWrapper');
        if (editVariantsWrapper && editVariantsWrapper.style.display === 'block') {
            const inputs = document.getElementById('editProductVariantsContainer').querySelectorAll('.variant-qty-input');
            inputs.forEach(input => {
                variants.push({
                    size: input.dataset.size || '',
                    color: input.dataset.color || '',
                    quantity: parseInt(input.value) || 0
                });
            });
            quantityVal = variants.reduce((sum, v) => sum + v.quantity, 0);
        } else {
            quantityVal = parseInt(document.getElementById('editProductQuantity')?.value) || 0;
        }

        const updateData = {
            name,
            price,
            categoryId,
            sizes: sizes,
            colors: colors,
            quantity: quantityVal,
            variants: variants
        };

        if (file) {
            addLog(`📤 Đang tải ảnh mới lên Storage...`, 'info', manageLog);
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const filepath = `products/${categoryId}/${filename}`;
            const storageRef = ref(storage, filepath);
            await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(storageRef);
            updateData.storagePath = filepath;
        }

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        await updateDoc(doc(db, 'products', id), updateData);
        addLog('✅ Cập nhật sản phẩm thành công!', 'success', manageLog);
        editProductModal.style.display = 'none';
        document.getElementById('loadProducts').click();
    } catch (error) {
        addLog(`❌ Lỗi cập nhật sản phẩm: ${error.message}`, 'error', manageLog);
    }
});

document.getElementById('editCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editCategoryId').value;
    const name = document.getElementById('editCategoryName').value.trim();
    let imageUrl = document.getElementById('editCategoryImageUrl').value.trim();
    const file = document.getElementById('editCategoryImage')?.files[0];

    addLog('💾 Đang lưu thay đổi danh mục...', 'info', manageLog);
    try {
        const updateData = {
            name
        };

        if (file) {
            addLog(`📤 Đang tải ảnh mới cho danh mục lên Storage...`, 'info', manageLog);
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;
            const filepath = `categories/${id}/${filename}`;
            const storageRef = ref(storage, filepath);
            await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(storageRef);
            updateData.storagePath = filepath;
        }

        if (imageUrl) {
            updateData.imageUrl = imageUrl;
        }

        await updateDoc(doc(db, 'categories', id), updateData);
        addLog('✅ Cập nhật danh mục thành công!', 'success', manageLog);
        editCategoryModal.style.display = 'none';
        document.getElementById('loadCategories').click();
        populateCategoryDropdowns();
    } catch (error) {
        addLog(`❌ Lỗi cập nhật danh mục: ${error.message}`, 'error', manageLog);
    }
});

function generateVariantsUI(sizesSelector, colorsSelector, containerId, wrapperId, qtyGroupId, existingVariants = null) {
    const container = document.getElementById(containerId);
    const wrapper = document.getElementById(wrapperId);
    const qtyGroup = document.getElementById(qtyGroupId);
    const qtyInput = qtyGroup?.querySelector('input');

    if (!container || !wrapper) return;

    let sizes = [];
    if (typeof sizesSelector === 'string') {
        sizes = Array.from(document.querySelectorAll(sizesSelector)).map(cb => cb.value);
    } else if (Array.isArray(sizesSelector)) {
        sizes = sizesSelector;
    }

    let colors = [];
    if (typeof colorsSelector === 'string') {
        colors = Array.from(document.querySelectorAll(colorsSelector)).map(cb => cb.value);
    } else if (Array.isArray(colorsSelector)) {
        colors = colorsSelector;
    }

    if (sizes.length === 0 && colors.length === 0) {
        wrapper.style.display = 'none';
        if (qtyGroup) qtyGroup.style.display = 'block';
        if (qtyInput) qtyInput.required = true;
        container.innerHTML = '';
        return;
    }

    wrapper.style.display = 'block';
    if (qtyGroup) qtyGroup.style.display = 'none';
    if (qtyInput) qtyInput.required = false;

    let combinations = [];
    if (sizes.length > 0 && colors.length > 0) {
        sizes.forEach(size => {
            colors.forEach(color => {
                combinations.push({ size, color });
            });
        });
    } else if (sizes.length > 0) {
        sizes.forEach(size => {
            combinations.push({ size, color: '' });
        });
    } else if (colors.length > 0) {
        colors.forEach(color => {
            combinations.push({ size: '', color });
        });
    }

    container.innerHTML = '';
    combinations.forEach(combo => {
        const keyLabel = (combo.size && combo.color) ? `${combo.size} - ${combo.color}` : (combo.size || combo.color);
        let val = 10;
        if (Array.isArray(existingVariants)) {
            const match = existingVariants.find(v => v.size === combo.size && v.color === combo.color);
            if (match) {
                val = match.quantity;
            }
        }

        const div = document.createElement('div');
        div.className = 'form-group variant-input-item';
        div.style.marginBottom = '5px';
        div.innerHTML = `
            <label style="font-size: 12px; margin-bottom: 2px; display: block;">${keyLabel}:</label>
            <input type="number" class="variant-qty-input" data-size="${combo.size}" data-color="${combo.color}" value="${val}" min="0" required style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px;">
        `;
        container.appendChild(div);
    });
}

// Add event listeners for checkbox changes
document.addEventListener('change', (e) => {
    if (e.target && (e.target.classList.contains('size-checkbox') || e.target.classList.contains('color-checkbox'))) {
        generateVariantsUI('.size-checkbox:checked', '.color-checkbox:checked', 'productVariantsContainer', 'productVariantsWrapper', 'productQuantityGroup');
    }
    if (e.target && (e.target.classList.contains('edit-size-checkbox') || e.target.classList.contains('edit-color-checkbox'))) {
        generateVariantsUI('.edit-size-checkbox:checked', '.edit-color-checkbox:checked', 'editProductVariantsContainer', 'editProductVariantsWrapper', 'editProductQuantityGroup');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    checkFirebaseConnection();
    updateProductCount();
    updateCategoryCount();
    populateCategoryDropdowns();
});
