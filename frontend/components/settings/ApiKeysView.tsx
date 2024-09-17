
import React, { useState } from 'react';
import { ApiKey } from '@type/apiKey';
import { Organization } from '@type/organization';
import { Button, ButtonType } from '@frontend/components/common/Button';
import { Input } from '@frontend/components/common/Input';
import { useUpdateApiKeyQuery } from '@frontend/queries/apiKeys/useUpdateApiKeyQuery';
import { useDeleteApiKeyQuery } from '@frontend/queries/apiKeys/useDeleteApiKeyQuery';
import { useCreateApiKeyQuery } from '@frontend/queries/apiKeys/useCreateApiKeyQuery';
import { CreateApiKeyModal } from './modals/CreateApiKeyModal';

interface Props {
  apiKeys: ApiKey[];
  organization: Organization;
}

export function ApiKeysView({ apiKeys: initialApiKeys, organization }: Props) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateApiKey = useUpdateApiKeyQuery();
  const deleteApiKey = useDeleteApiKeyQuery();
  const createApiKey = useCreateApiKeyQuery();

  const handleEdit = (apiKey: ApiKey) => {
    setEditingId(apiKey.id);
    setEditName(apiKey.name || '');
  };

  const handleSave = async (apiKey: ApiKey) => {
    try {
      const updatedApiKey = await updateApiKey.execute({ 
        api_key_id: apiKey.id, 
        organization_id: organization.id, 
        name: editName 
      });
      setApiKeys(keys => keys.map(key => key.id === apiKey.id ? updatedApiKey : key));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update API key:', error);
    }
  };

  const handleDelete = async (apiKey: ApiKey) => {
    if (window.confirm('Are you sure you want to delete this API key?')) {
      try {
        await deleteApiKey.execute({ 
          api_key_id: apiKey.id, 
          organization_id: organization.id 
        });
        setApiKeys(keys => keys.filter(key => key.id !== apiKey.id));
      } catch (error) {
        console.error('Failed to delete API key:', error);
      }
    }
  };

  const handleCreate = (newApiKey: ApiKey) => {
    setApiKeys(keys => [...keys, newApiKey]);
    setIsModalOpen(false);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">API Keys</h2>
        <Button 
          type={ButtonType.Primary} 
          onClick={() => setIsModalOpen(true)}
        >
          New API Key
        </Button>
      </div>
      <CreateApiKeyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreate}
        organizationId={organization.id}
      />
      {apiKeys.map((apiKey) => (
        <div key={apiKey.id} className="bg-secondary-background p-4 rounded-md">
          {editingId === apiKey.id ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="API Key Name"
              />
              <Button 
                type={ButtonType.Primary} 
                onClick={() => handleSave(apiKey)}
                loading={updateApiKey.loading}
              >
                Save
              </Button>
              <Button type={ButtonType.Secondary} onClick={() => setEditingId(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{apiKey.name || 'Unnamed Key'}</p>
                <p className="text-sm text-text-secondary">{apiKey.key}</p>
                <p className="text-xs text-text-tertiary">
                  Last used: {apiKey.last_used_at || 'Never'}
                </p>
              </div>
              <div className="space-x-2">
                <Button type={ButtonType.Secondary} onClick={() => handleEdit(apiKey)}>
                  Edit
                </Button>
                <Button 
                  type={ButtonType.Warning} 
                  onClick={() => handleDelete(apiKey)}
                  loading={deleteApiKey.loading}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      {(updateApiKey.error || deleteApiKey.error || createApiKey.error) && (
        <p className="text-error mt-2">
          {updateApiKey.error || deleteApiKey.error || createApiKey.error}
        </p>
      )}
    </div>
  );
}
