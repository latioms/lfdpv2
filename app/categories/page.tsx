// app/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePowerSync } from '@/hooks/usePowerSync';
import { v4 as uuidv4 } from 'uuid';

// Composant principal pour afficher et gérer les catégories
export default function CategoriesPage() {
  // Utilisation du hook personnalisé pour obtenir l'instance de PowerSync
  const powerSync = usePowerSync();
  const [categories, setCategories] = useState<any[]>([]); // État pour stocker les catégories
  const [loading, setLoading] = useState(true); // État pour gérer le chargement
  const [newCategory, setNewCategory] = useState({ name: '' }); // État pour la nouvelle catégorie

  // Effet pour récupérer les catégories lors du montage du composant
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (!powerSync) {
          throw new Error('PowerSync is not connected');
        }
        // Récupération de toutes les catégories
        const result = await powerSync.getAll('SELECT * FROM categories');
        setCategories(result);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [powerSync]);

  // Fonction pour ajouter une nouvelle catégorie
  const addCategory = async () => {
    try {
      if (!powerSync) {
        throw new Error('PowerSync is not connected');
      }
      const newId = uuidv4(); // Génération d'un ID unique
      // Insertion de la nouvelle catégorie dans la base de données
      await powerSync.execute('INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)', [newId, newCategory.name, new Date().toISOString()]);
      setNewCategory({ name: '' }); // Réinitialisation de l'état de la nouvelle catégorie
      // Mise à jour de la liste des catégories
      const updatedCategories = await powerSync.getAll('SELECT * FROM categories');
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  // Fonction pour supprimer une catégorie
  const deleteCategory = async (id: string) => {
    try {
      if (!powerSync) {
        throw new Error('PowerSync is not connected');
      }
      // Suppression de la catégorie de la base de données
      await powerSync.execute('DELETE FROM categories WHERE id = ?', [id]);
      // Mise à jour de la liste des catégories
      const updatedCategories = await powerSync.getAll('SELECT * FROM categories');
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Categories</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Category name"
          value={newCategory.name}
          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
          className="border p-2 mr-2"
        />
        <button onClick={addCategory} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Category
        </button>
      </div>
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">ID</th>
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Created At</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="border p-2">{category.id}</td>
                <td className="border p-2">{category.name}</td>
                <td className="border p-2">{category.created_at}</td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
