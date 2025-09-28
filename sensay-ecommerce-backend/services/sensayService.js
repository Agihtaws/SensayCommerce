const axios = require('axios');
const SensayBalance = require('../models/SensayBalance');
const SensayTransaction = require('../models/SensayTransaction');

class SensayService {
  constructor() {
    this.baseURL = process.env.SENSAY_BASE_URL;
    this.organizationSecret = process.env.SENSAY_ORGANIZATION_SECRET;
    this.organizationId = process.env.SENSAY_ORGANIZATION_ID;
    this.apiVersion = process.env.SENSAY_API_VERSION;
    this.systemUserId = process.env.SENSAY_SYSTEM_USER_ID;
    this.replicaName = process.env.SENSAY_REPLICA_NAME;
    
    this.replicaUUID = null;
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-ORGANIZATION-SECRET': this.organizationSecret,
        'X-API-Version': this.apiVersion,
        'Content-Type': 'application/json'
      },
      timeout: 15000, // NEW: Add a 15-second timeout for all Sensay API calls
    });
  }

  async deductBalance(userId, amount, transactionType, description, metadata = {}) {
    try {
      const balance = await SensayBalance.findOne({ userId });
      if (!balance) {
        throw new Error('Balance record not found');
      }

      if (balance.currentBalance < amount) {
        throw new Error('Insufficient balance');
      }

      const balanceBefore = balance.currentBalance;
      balance.currentBalance -= amount;
      balance.totalSpent += amount;
      balance.lastUpdated = new Date();
      await balance.save();

      const transaction = new SensayTransaction({
        userId,
        transactionType,
        amount,
        balanceBefore,
        balanceAfter: balance.currentBalance,
        description,
        metadata
      });
      await transaction.save();

      console.log(`✅ Balance deducted: ${amount} units. New balance: ${balance.currentBalance}`);

      return {
        success: true,
        balanceBefore,
        balanceAfter: balance.currentBalance,
        transaction
      };
    } catch (error) {
      console.error('❌ Balance deduction error:', error);
      throw error;
    }
  }

  async ensureSystemUser() {
    try {
      const response = await this.axiosInstance.get(`/v1/users/${this.systemUserId}`, {
        headers: {
          'X-USER-ID': this.systemUserId
        }
      });
      
      console.log('✅ System user verified:', response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          const createResponse = await this.axiosInstance.post(`/v1/users`, {
            id: this.systemUserId
          });
          console.log('✅ System user created:', createResponse.data);
          return createResponse.data;
        } catch (createError) {
          if (createError.response?.data?.error === 'A user with this ID already exists') {
            console.log('✅ System user exists:', { success: true, id: this.systemUserId, linkedAccounts: [] });
            return { success: true, id: this.systemUserId, linkedAccounts: [] };
          }
          console.error('❌ Error creating system user:', createError.response?.data || createError.message);
          throw createError;
        }
      }
      console.error('❌ Error checking system user:', error.response?.data || error.message);
      throw error;
    }
  }

  async ensureReplica(userId = null) {
    try {
      if (userId) {
        await this.deductBalance(userId, 5, 'replica_creation', 'Replica initialization/check');
      }

      await this.ensureSystemUser();

      const response = await this.axiosInstance.get(`/v1/replicas`, {
        headers: {
          'X-USER-ID': this.systemUserId
        }
      });

      const existingReplica = response.data.items?.find(
        replica => replica.name === this.replicaName
      );

      if (existingReplica) {
        console.log('✅ Replica verified:', existingReplica.name);
        this.replicaUUID = existingReplica.uuid;
        return existingReplica;
      }

      // In your sensayService.js, update the replica creation:
const createResponse = await this.axiosInstance.post(`/v1/replicas`, {
  name: this.replicaName,
  shortDescription: 'AI assistant for e-commerce platform',
  greeting: 'Hello! I\'m your e-commerce assistant. How can I help you find the perfect product today?',
  ownerID: this.systemUserId,
  private: false,
  slug: this.replicaName.toLowerCase().replace(/ /g, '-'),
  llm: {
    provider: 'openai',
    model: 'gpt-4o',
    instructions: `You are a strict e-commerce assistant for Sensay Shop. You MUST ONLY use information from your knowledge base to answer questions about products.

CRITICAL RULES:
1. If your knowledge base contains NO products, you MUST respond: "Currently, there are no products available in our catalog. Please check back later or contact support."
2. If asked about a specific product NOT in your knowledge base, respond: "I don't have information about that product in our current catalog."
3. NEVER invent, hallucinate, or use general knowledge about products.
4. ONLY mention products that are explicitly listed in your knowledge base.
5. For general questions about categories, ONLY mention categories if you have actual products in those categories.

For user account questions (cart, orders, wishlist), use the provided user context.

REMEMBER: Your knowledge base is your ONLY source of product information.`
  }
});


      console.log('✅ Replica created:', createResponse.data);
      this.replicaUUID = createResponse.data.uuid;
      return createResponse.data;
    } catch (error) {
      console.error('❌ Replica management error:', error.response?.data || error.message);
      throw error;
    }
  }

  async addKnowledge(userId, content, contentType = 'product') {
    try {
      await this.deductBalance(userId, 10, 'knowledge_update', `Adding ${contentType} knowledge`, {
        contentType,
        contentLength: content.length
      });

      if (!this.replicaUUID) {
        await this.ensureReplica();
      }

      const response = await this.axiosInstance.post(`/v1/replicas/${this.replicaUUID}/knowledge-base`, {
        text: content
      });

      console.log('✅ Knowledge added to Sensay:', response.data);
      
      return {
        success: true,
        knowledgeBaseID: response.data.results[0].knowledgeBaseID,
        content: content,
        status: 'enqueued',
        message: 'Knowledge successfully added to Sensay AI system'
      };
    } catch (error) {
      console.error('❌ Knowledge addition error:', error.response?.data || error.message);
      throw error;
    }
  }

  async addFileKnowledge(userId, filename, filetype, title = null) {
    try {
      await this.deductBalance(userId, 10, 'knowledge_update', `Adding file knowledge: ${filename}`, {
        filename,
        filetype
      });

      if (!this.replicaUUID) {
        await this.ensureReplica();
      }

      const payload = {
        filename: filename,
      };
      if (title) {
        payload.title = title;
      }

      const response = await this.axiosInstance.post(`/v1/replicas/${this.replicaUUID}/knowledge-base`, payload);

      console.log('✅ File knowledge entry created on Sensay:', response.data);
      
      return {
        success: true,
        knowledgeBaseID: response.data.results[0].knowledgeBaseID,
        signedURL: response.data.results[0].signedURL,
        message: 'File knowledge entry created, awaiting upload to signed URL'
      };
    } catch (error) {
      console.error('❌ File knowledge creation error on Sensay:', error.response?.data || error.message);
      throw error;
    }
  }

  async uploadFileToSensay(signedURL, file, contentType) {
    try {
      const response = await axios.put(signedURL, file, {
        headers: {
          'Content-Type': contentType,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000, // NEW: Longer timeout for large file uploads
      });
      console.log('✅ File uploaded to Sensay signed URL:', response.status);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Failed to upload file to Sensay signed URL:', error.response?.data || error.message);
      throw error;
    }
  }

  // Replace this function in your sensayService.js:
async manageCatalogState(adminUserId = null) {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');
    
    // Get admin user ID if not provided
    let userId = adminUserId;
    if (!userId) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (!adminUser) {
        throw new Error('No admin user found for system operations');
      }
      userId = adminUser._id;
    }
    
    const activeProducts = await Product.find({ isActive: true });
    
    if (activeProducts.length === 0) {
      // Catalog is empty - add empty state knowledge
      await this.addKnowledge(
        userId, // <- NOW USING PROPER ObjectId
        "IMPORTANT: The product catalog is currently empty. There are no products available for purchase. When customers ask about products, inform them that no products are currently listed and they should check back later.",
        'catalog_state'
      );
      console.log('✅ Empty catalog state added to Sensay');
    } else {
      // Catalog has products - ensure all are synced
      let syncCount = 0;
      for (const product of activeProducts) {
        if (!product.sensayKnowledgeId || product.sensayStatus !== 'synced') {
          try {
            const knowledgeContent = product.toSensayKnowledge();
            const result = await this.addKnowledge(userId, knowledgeContent, 'product');
            
            product.sensayKnowledgeId = result.knowledgeBaseID;
            product.sensayLastSynced = new Date();
            product.sensayStatus = 'synced';
            await product.save();
            syncCount++;
          } catch (syncError) {
            console.error(`❌ Failed to sync product ${product.name}:`, syncError.message);
          }
        }
      }
      console.log(`✅ Catalog state managed: ${activeProducts.length} products, ${syncCount} synced`);
    }
  } catch (error) {
    console.error('❌ Catalog state management failed:', error);
    throw error;
  }
}


  async getKnowledgeBaseEntryStatus(knowledgeBaseID) {
    try {
      if (!this.replicaUUID) {
        await this.ensureReplica();
      }
      const response = await this.axiosInstance.get(`/v1/replicas/${this.replicaUUID}/knowledge-base/${knowledgeBaseID}`);
      return { success: true, status: response.data.status, entry: response.data };
    } catch (error) {
      console.error('❌ Failed to get knowledge base entry status:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateKnowledge(userId, knowledgeId, content, contentType = 'manual_update') {
    try {
      await this.deductBalance(userId, 8, 'knowledge_update', `Updating ${contentType} knowledge`, {
        contentType,
        knowledgeId,
        contentLength: content.length
      });

      if (!this.replicaUUID) {
        await this.ensureReplica();
      }

      const response = await this.axiosInstance.patch(`/v1/replicas/${this.replicaUUID}/knowledge-base/${knowledgeId}`, {
        rawText: content,
        title: `${contentType} - Updated`
      });

      console.log('✅ Knowledge updated in Sensay:', response.data);
      
      return {
        success: true,
        knowledgeBaseID: knowledgeId,
        content: content,
        message: 'Knowledge successfully updated in Sensay AI system'
      };
    } catch (error) {
      console.error('❌ Knowledge update error:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteKnowledge(userId, knowledgeBaseID) {
    try {
      await this.deductBalance(userId, 3, 'knowledge_update', 'Deleting knowledge', {
        knowledgeBaseID
      });

      if (!this.replicaUUID) {
        await this.ensureReplica();
      }

      const response = await this.axiosInstance.delete(`/v1/replicas/${this.replicaUUID}/knowledge-base/${knowledgeBaseID}`);

      console.log('✅ Knowledge deleted from Sensay:', response.data);
      
      return {
        success: true,
        message: 'Knowledge successfully deleted from Sensay AI system'
      };
    } catch (error) {
      console.error('❌ Knowledge deletion error:', error.response?.data || error.message);
      throw error;
    }
  }

  async chatCompletion(userId, message, context = {}) {
    try {
      await this.deductBalance(userId, 15, 'chat_completion', 'AI chat interaction', {
        messageLength: message.length,
        hasContext: Object.keys(context).length > 0
      });

      if (!this.replicaUUID) {
        await this.ensureReplica();
      }

      let combinedMessage = message;

      if (context.isLoggedIn) {
        let userContextString = `Context about the user: The current user is ${context.customerName} (${context.email}). They are a logged-in customer.`;
        if (context.recentOrders && context.recentOrders.length > 0) {
          userContextString += ` Their recent orders are: ${JSON.stringify(context.recentOrders)}.`;
        }
        if (context.cartProducts && context.cartProducts.length > 0) {
          userContextString += ` Their current cart items include: ${JSON.stringify(context.cartProducts)}.`;
        }
        combinedMessage = `${userContextString}\n\nUser's query: "${message}"`;
      }
      
      const response = await this.axiosInstance.post(`/v1/replicas/${this.replicaUUID}/chat/completions`, {
        content: combinedMessage
      }, {
        headers: {
          'X-USER-ID': this.systemUserId
        }
      });

      console.log('✅ Real Sensay AI response generated');
      
      return {
        success: true,
        content: response.data.content,
        context: context,
        timestamp: new Date().toISOString(),
        model: 'sensay-real-api',
        replicaUUID: this.replicaUUID
      };
    } catch (error) {
      console.error('❌ Chat completion error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getChatHistory(userId, limit = 20) {
    try {
      if (!this.replicaUUID) {
        await this.ensureReplica();
      }

      const response = await this.axiosInstance.get(`/v1/replicas/${this.replicaUUID}/chat/history`, {
        headers: {
          'X-USER-ID': this.systemUserId
        },
        params: {
          limit: limit
        }
      });

      console.log('✅ Chat history retrieved from Sensay');
      
      return {
        success: true,
        items: response.data.items || [],
        total: response.data.items?.length || 0
      };
    } catch (error) {
      console.error('❌ Chat history error:', error.response?.data || error.message);
      return {
        success: false,
        totalItems: 0,
        items: [],
        error: error.message
      };
    }
  }

  async getAllKnowledgeBaseEntries() {
    try {
      if (!this.replicaUUID) {
        await this.ensureReplica();
      }
      const response = await this.axiosInstance.get(`/v1/replicas/${this.replicaUUID}/knowledge-base`);
      console.log('✅ All knowledge base entries retrieved');
      return { success: true, totalItems: response.data.total || 0, items: response.data.items || [] };
    } catch (error) {
      // NEW: More specific error handling for network/timeout/rate limit
      if (axios.isAxiosError(error) && (error.code === 'ECONNABORTED' || error.response?.status === 408)) {
        console.error('❌ Sensay API request timed out:', error.message);
        throw new Error('Sensay API request timed out. Please try again.');
      } else if (axios.isAxiosError(error) && error.response?.status === 429) {
        console.error('❌ Sensay API rate limit hit:', error.message);
        throw new Error('Sensay API rate limit hit. Please try again later.');
      } else if (axios.isAxiosError(error) && error.response?.status >= 500) {
        console.error('❌ Sensay API server error:', error.message);
        throw new Error('Sensay API server error. Please try again later.');
      }
      console.error('❌ Failed to get all knowledge base entries:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to get knowledge entries');
    }
  }

  async getSystemStatus() {
    try {
      const userStatus = await this.ensureSystemUser();
      const replicaStatus = await this.ensureReplica();
      const knowledgeBaseStatus = await this.getAllKnowledgeBaseEntries();
      
      return {
        success: true,
        system: {
          organizationId: this.organizationId,
          systemUserId: this.systemUserId,
          replicaName: this.replicaName,
          replicaUUID: this.replicaUUID,
          mode: 'real-sensay-api',
          balanceTracking: 'real',
          aiResponses: 'real-sensay'
        },
        user: userStatus,
        replica: replicaStatus,
        knowledgeBase: knowledgeBaseStatus
      };
    } catch (error) {
      console.error('❌ System status error:', error.response?.data || error.message);
      throw error;
    }
  }

  async reinitializeSystem(userId) {
    try {
      await this.deductBalance(userId, 50, 'replica_creation', 'System reinitialization');

      console.log('🔄 Reinitializing Real Sensay system...');
      
      const userStatus = await this.ensureSystemUser();
      const replicaStatus = await this.ensureReplica();
      
      return {
        success: true,
        message: 'Real Sensay system reinitialized successfully',
        user: userStatus,
        replica: replicaStatus,
        replicaUUID: this.replicaUUID
      };
    } catch (error) {
      console.error('❌ System reinitialization error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new SensayService();
