import { useEffect, useRef, useState } from 'react';
import { photosAPI, personsAPI } from '../../api/client';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export default function PhotoUploader({ person, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [caption, setCaption] = useState('');
  const [year, setYear] = useState('');
  const [isAvatar, setIsAvatar] = useState(!person.avatar_url);
  const [toast, setToast] = useState(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    loadPhotos();
    initWidget();
    return () => {
      if (widgetRef.current) widgetRef.current.destroy();
    };
  }, []);

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const res = await photosAPI.list(person.id);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setPhotos(data);
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const initWidget = () => {
    if (!window.cloudinary) return;
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        multiple: false,
        maxFiles: 1,
        cropping: true,
        croppingAspectRatio: 1,
        showSkipCropButton: true,
        sources: ['local', 'camera'],
        styles: {
          palette: {
            window: '#1f2937',
            windowBorder: '#374151',
            tabIcon: '#a855f7',
            menuIcons: '#9ca3af',
            textDark: '#ffffff',
            textLight: '#1f2937',
            link: '#a855f7',
            action: '#7c3aed',
            inactiveTabIcon: '#6b7280',
            error: '#ef4444',
            inProgress: '#a855f7',
            complete: '#10b981',
            sourceBg: '#111827',
          },
        },
      },
      async (error, result) => {
        if (error) {
          showToast('Error al subir la imagen', 'error');
          return;
        }
        if (result.event === 'success') {
          const cloudinaryUrl = result.info.secure_url;
          await savePhoto(cloudinaryUrl);
        }
      }
    );
  };

  const savePhoto = async (cloudinaryUrl) => {
    try {
      setUploading(true);

      // 1. Guardar en person_photos
      console.log('ENVIANDO FOTO:', {
        cloudinary_url: cloudinaryUrl,
        caption: caption,
        year: year ? parseInt(year) : null,
      });

      await photosAPI.upload(person.id, {
        cloudinary_url: cloudinaryUrl,
        caption: caption || '',
        year: year ? parseInt(year) : null,
      });

      // 2. Si es avatar o es la primera foto, actualizar avatar_url
      if (isAvatar || !person.avatar_url) {
        await personsAPI.update(person.id, {
          avatar_url: cloudinaryUrl,
        });
      }

      showToast('Foto subida correctamente');
      loadPhotos();
      setCaption('');
      setYear('');

      if (onSuccess) onSuccess(cloudinaryUrl);
    } catch (err) {
      showToast(err.message || 'Error al guardar la foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await photosAPI.delete(photoId);
      showToast('Foto eliminada');
      loadPhotos();
    } catch (err) {
      showToast(err.message || 'Error al eliminar', 'error');
    }
  };

  const handleSetAvatar = async (photoUrl) => {
    try {
      await personsAPI.update(person.id, { avatar_url: photoUrl });
      showToast('Foto de perfil actualizada');
      if (onSuccess) onSuccess(photoUrl);
    } catch (err) {
      showToast(err.message || 'Error al actualizar perfil', 'error');
    }
  };

  const openWidget = () => {
    if (!widgetRef.current) {
      showToast('Widget no disponible, recarga la página', 'error');
      return;
    }
    widgetRef.current.open();
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #374151',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
              Fotos de {person.first_name}
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0 0' }}>
              {photos.length} foto{photos.length !== 1 ? 's' : ''} subida{photos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>

          {/* Upload section */}
          <div
            style={{
              background: '#111827',
              border: '2px dashed #374151',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <h4 style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
              Subir nueva foto
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ej: Boda de los abuelos"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#9ca3af', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  Año (opcional)
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Ej: 1975"
                  min="1850"
                  max={new Date().getFullYear()}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#9ca3af',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              <input
                type="checkbox"
                checked={isAvatar}
                onChange={(e) => setIsAvatar(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              Usar como foto de perfil (aparece en la estrella de la constelación)
            </label>

            <button
              onClick={openWidget}
              disabled={uploading}
              style={{
                width: '100%',
                padding: '12px',
                background: uploading ? '#4b5563' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              {uploading ? '⏳ Subiendo...' : '📸 Seleccionar foto'}
            </button>
          </div>

          {/* Existing photos */}
          <h4 style={{ color: '#d1d5db', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
            Fotos existentes
          </h4>

          {loadingPhotos ? (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>Cargando fotos...</p>
          ) : photos.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
              No hay fotos aún — sube la primera
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}
            >
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    background: '#111827',
                    border: person.avatar_url === photo.cloudinary_url
                      ? '2px solid #a855f7'
                      : '1px solid #374151',
                  }}
                >
                  <img
                    src={photo.cloudinary_url}
                    alt={photo.caption || 'Foto familiar'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Badge avatar actual */}
                  {person.avatar_url === photo.cloudinary_url && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: '#7c3aed',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        color: '#fff',
                        fontWeight: '600',
                      }}
                    >
                      Perfil
                    </div>
                  )}
                  {/* Acciones al hover */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    {person.avatar_url !== photo.cloudinary_url && (
                      <button
                        onClick={() => handleSetAvatar(photo.cloudinary_url)}
                        style={{
                          background: '#7c3aed',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '11px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontWeight: '600',
                        }}
                      >
                        Usar de perfil
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      style={{
                        background: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#fff',
                        fontSize: '11px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                  {/* Caption y año */}
                  {(photo.caption || photo.year) && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        padding: '8px 6px 4px',
                        fontSize: '10px',
                        color: '#d1d5db',
                      }}
                    >
                      {photo.caption && <div>{photo.caption}</div>}
                      {photo.year && <div style={{ color: '#9ca3af' }}>{photo.year}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: '10px',
            background: toast.type === 'error' ? '#dc2626' : '#059669',
            color: '#fff',
            fontWeight: '600',
            fontSize: '14px',
            zIndex: 10000,
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
