const { Provider } = require('../models');
const { providerSchema } = require('../validators/validators');
const { Op } = require('sequelize');

exports.getAllProviders = async (req, res, next) => {
  try {
    const { search = '', skill_type = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { skill_type: { [Op.like]: `%${search}%` } },
      ];
    }
    if (skill_type) {
      where.skill_type = { [Op.like]: `%${skill_type}%` };
    }

    const { count, rows } = await Provider.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      providers: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findByPk(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }
    res.json({ provider });
  } catch (error) {
    next(error);
  }
};

exports.createProvider = async (req, res, next) => {
  try {
    const { error, value } = providerSchema.validate(req.body, { allowUnknown: true, abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, skill_type, phoneno, availabilitystatus } = value;
    const provider = await Provider.create({ name, skill_type, phoneno, availabilitystatus });
    res.status(201).json({ message: 'Provider created successfully.', provider });
  } catch (error) {
    next(error);
  }
};

exports.updateProvider = async (req, res, next) => {
  try {
    const { error, value } = providerSchema.validate(req.body, { allowUnknown: true, abortEarly: false });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const provider = await Provider.findByPk(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    const { name, skill_type, phoneno, availabilitystatus } = value;
    await provider.update({ name, skill_type, phoneno, availabilitystatus });
    res.json({ message: 'Provider updated successfully.', provider });
  } catch (error) {
    next(error);
  }
};

exports.deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByPk(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found.' });
    }

    await provider.destroy();
    res.json({ message: 'Provider deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
