package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BamsTagDictionary;
import org.apache.ibatis.annotations.Param;

/**
 * 标签字典Mapper接口
 *
 * @author ruoyi
 * @date 2025-11-19
 */
public interface BamsTagDictionaryMapper
{
    /**
     * 查询标签字典
     *
     * @param tagId 标签主键
     * @return 标签字典
     */
    public BamsTagDictionary selectBamsTagDictionaryByTagId(Long tagId);

    /**
     * 根据标签名称查询标签
     *
     * @param tagName 标签名称
     * @return 标签字典
     */
    public BamsTagDictionary selectBamsTagDictionaryByTagName(String tagName);

    /**
     * 查询标签字典列表
     *
     * @param bamsTagDictionary 标签字典
     * @return 标签字典集合
     */
    public List<BamsTagDictionary> selectBamsTagDictionaryList(BamsTagDictionary bamsTagDictionary);

    /**
     * 查询所有启用的标签
     *
     * @return 标签列表
     */
    public List<BamsTagDictionary> selectEnabledTags();

    /**
     * 新增标签字典
     *
     * @param bamsTagDictionary 标签字典
     * @return 结果
     */
    public int insertBamsTagDictionary(BamsTagDictionary bamsTagDictionary);

    /**
     * 修改标签字典
     *
     * @param bamsTagDictionary 标签字典
     * @return 结果
     */
    public int updateBamsTagDictionary(BamsTagDictionary bamsTagDictionary);

    /**
     * 删除标签字典
     *
     * @param tagId 标签主键
     * @return 结果
     */
    public int deleteBamsTagDictionaryByTagId(Long tagId);

    /**
     * 批量删除标签字典
     *
     * @param tagIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBamsTagDictionaryByTagIds(Long[] tagIds);

    /**
     * 增加标签使用次数
     *
     * @param tagId 标签主键
     * @return 结果
     */
    public int incrementUsageCount(@Param("tagId") Long tagId);

    /**
     * 减少标签使用次数
     *
     * @param tagId 标签主键
     * @return 结果
     */
    public int decrementUsageCount(@Param("tagId") Long tagId);

    /**
     * 批量增加标签使用次数
     *
     * @param tagIds 标签ID列表
     * @return 结果
     */
    public int batchIncrementUsageCount(@Param("tagIds") List<Long> tagIds);

    /**
     * 批量减少标签使用次数
     *
     * @param tagIds 标签ID列表
     * @return 结果
     */
    public int batchDecrementUsageCount(@Param("tagIds") List<Long> tagIds);
}
